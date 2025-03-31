import {
	type ActionNode,
	type Connection,
	type ConnectionId,
	type Node,
	type NodeId,
	type WorkflowId,
	isActionNode,
} from "@giselle-sdk/data-type";
import { describe, expect, test } from "vitest";
import {
	createConnectedNodeIdMap,
	createJobMap,
	findConnectedConnectionMap,
	findConnectedNodeMap,
} from "./helper";

// Sample data for tests based on provided workflow JSON
const sampleNodes: Node[] = [
	{
		id: "nd-KzXeXSIffRIMwZtX",
		type: "action",
		inputs: [],
		outputs: [
			{
				id: "otp-93MKjM7HdSu3hOdw",
				label: "Output",
				accessor: "generated-text",
			},
		],
		content: {
			type: "textGeneration",
			llm: {
				provider: "openai",
				id: "gpt-4o-mini",
				configurations: {
					temperature: 0.7,
					topP: 1,
					presencePenalty: 0,
					frequencyPenalty: 0,
				},
			},
			prompt:
				'{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello"}]}]}',
		},
	},
	{
		id: "nd-P2EllMigi6Tm6gij",
		type: "action",
		inputs: [{ id: "inp-id3Grof8Hyy3DJbN", label: "Input" }],
		outputs: [
			{
				id: "otp-Fdzlled7cDxSIa7G",
				label: "Output",
				accessor: "generated-text",
			},
		],
		content: {
			type: "textGeneration",
			llm: {
				provider: "openai",
				id: "gpt-4o-mini",
				configurations: {
					temperature: 0.7,
					topP: 1,
					presencePenalty: 0,
					frequencyPenalty: 0,
				},
			},
		},
	},
] as Node[];

const sampleConnections: Connection[] = [
	{
		id: "cnnc-7SZdtE1iSWtoghGD",
		outputNode: {
			id: "nd-KzXeXSIffRIMwZtX",
			type: "action",
			content: { type: "textGeneration" },
		},
		outputId: "otp-93MKjM7HdSu3hOdw",
		inputNode: {
			id: "nd-P2EllMigi6Tm6gij",
			type: "action",
			content: { type: "textGeneration" },
		},
		inputId: "inp-id3Grof8Hyy3DJbN",
	},
] as Connection[];

// Setup helper variables
const nodeSet = new Set<Node>(sampleNodes);
const connectionSet = new Set<Connection>(sampleConnections);
const nodeIdSet = new Set<NodeId>(sampleNodes.map((node) => node.id));
const nodeMap = new Map<NodeId, Node>(
	sampleNodes.map((node) => [node.id, node]),
);
const connectionMap = new Map<ConnectionId, Connection>(
	sampleConnections.map((connection) => [connection.id, connection]),
);
const workflowId = "wf-N5RH1s46zdx3XjQj" as WorkflowId;

describe("createConnectedNodeIdMap", () => {
	test("should create a correct connection map for sample nodes", () => {
		const result = createConnectedNodeIdMap(connectionSet, nodeIdSet);

		expect(result).toBeInstanceOf(Map);
		expect(result.size).toBe(2); // Two nodes in our sample

		// Check node1 connections
		const node1Connections = result.get("nd-KzXeXSIffRIMwZtX");
		expect(node1Connections).toBeInstanceOf(Set);
		expect(node1Connections?.size).toBe(1);
		expect(node1Connections?.has("nd-P2EllMigi6Tm6gij")).toBe(true);

		// Check node2 connections
		const node2Connections = result.get("nd-P2EllMigi6Tm6gij");
		expect(node2Connections).toBeInstanceOf(Set);
		expect(node2Connections?.size).toBe(1);
		expect(node2Connections?.has("nd-KzXeXSIffRIMwZtX")).toBe(true);
	});

	test("should handle empty connections", () => {
		const result = createConnectedNodeIdMap(new Set<Connection>(), nodeIdSet);
		expect(result).toBeInstanceOf(Map);
		expect(result.size).toBe(0);
	});
});

describe("findConnectedNodeMap", () => {
	const connectedNodeIdMap = createConnectedNodeIdMap(connectionSet, nodeIdSet);

	test("should find all connected nodes starting from first node", () => {
		const result = findConnectedNodeMap(
			"nd-KzXeXSIffRIMwZtX",
			nodeMap,
			connectedNodeIdMap,
		);

		expect(result).toBeInstanceOf(Map);
		expect(result.size).toBe(2); // Both nodes are connected
		expect(result.has("nd-KzXeXSIffRIMwZtX")).toBe(true);
		expect(result.has("nd-P2EllMigi6Tm6gij")).toBe(true);
	});

	test("should find all connected nodes starting from second node", () => {
		const result = findConnectedNodeMap(
			"nd-P2EllMigi6Tm6gij",
			nodeMap,
			connectedNodeIdMap,
		);

		expect(result).toBeInstanceOf(Map);
		expect(result.size).toBe(2); // Both nodes are connected
		expect(result.has("nd-KzXeXSIffRIMwZtX")).toBe(true);
		expect(result.has("nd-P2EllMigi6Tm6gij")).toBe(true);
	});

	test("should handle non-existent starting node", () => {
		const result = findConnectedNodeMap(
			"non-existent-node-id" as NodeId,
			nodeMap,
			connectedNodeIdMap,
		);

		expect(result).toBeInstanceOf(Map);
		expect(result.size).toBe(0);
	});
});

describe("findConnectedConnectionMap", () => {
	test("should find connections between connected nodes", () => {
		const connectedNodeIdMap = createConnectedNodeIdMap(
			connectionSet,
			nodeIdSet,
		);
		const connectedNodeMap = findConnectedNodeMap(
			"nd-KzXeXSIffRIMwZtX",
			nodeMap,
			connectedNodeIdMap,
		);

		const result = findConnectedConnectionMap(
			new Set(connectedNodeMap.keys()),
			connectionSet,
		);

		expect(result).toBeInstanceOf(Map);
		expect(result.size).toBe(1); // One connection in our sample
		expect(result.has("cnnc-7SZdtE1iSWtoghGD")).toBe(true);
	});

	test("should handle empty node set", () => {
		const result = findConnectedConnectionMap(new Set<NodeId>(), connectionSet);

		expect(result).toBeInstanceOf(Map);
		expect(result.size).toBe(0);
	});
});

describe("createJobMap", () => {
	test("should create jobs for the sample workflow", () => {
		const result = createJobMap(nodeSet, connectionSet, workflowId);

		expect(result).toBeInstanceOf(Map);
		expect(result.size).toBe(2); // Two jobs because of the dependency structure

		// Convert to array to analyze in order
		const jobsArray = Array.from(result.values());

		// First job should contain the first node (which has no inputs)
		expect(jobsArray[0].workflowId).toBe(workflowId);
		expect(jobsArray[0].actions.length).toBe(1);
		expect(jobsArray[0].actions[0].node.id).toBe("nd-KzXeXSIffRIMwZtX");

		// Second job should contain the second node (which depends on the first)
		expect(jobsArray[1].workflowId).toBe(workflowId);
		expect(jobsArray[1].actions.length).toBe(1);
		expect(jobsArray[1].actions[0].node.id).toBe("nd-P2EllMigi6Tm6gij");

		// Check generation templates
		expect(jobsArray[0].actions[0].generationTemplate.sourceNodes.length).toBe(
			0,
		);
		expect(jobsArray[1].actions[0].generationTemplate.sourceNodes.length).toBe(
			1,
		);
		expect(jobsArray[1].actions[0].generationTemplate.sourceNodes[0].id).toBe(
			"nd-KzXeXSIffRIMwZtX",
		);
	});

	test("should handle empty node set", () => {
		const result = createJobMap(new Set<Node>(), connectionSet, workflowId);

		expect(result).toBeInstanceOf(Map);
		expect(result.size).toBe(0);
	});
});
