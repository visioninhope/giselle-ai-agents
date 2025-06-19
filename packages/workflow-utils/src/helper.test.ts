import type {
	Connection,
	Node,
	NodeId,
	WorkflowId,
} from "@giselle-sdk/data-type";
import { describe, expect, test } from "vitest";
import {
	buildConnectedNodeIdList,
	buildJobList,
	collectConnectedConnections,
	collectConnectedNodes,
} from "./helper";

// Sample data for tests based on provided workflow JSON
const sampleNodes: Node[] = [
	{
		id: "nd-KzXeXSIffRIMwZtX",
		type: "operation",
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
				id: "gpt-4.1-mini",
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
		type: "operation",
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
			type: "operation",
			content: { type: "textGeneration" },
		},
		outputId: "otp-93MKjM7HdSu3hOdw",
		inputNode: {
			id: "nd-P2EllMigi6Tm6gij",
			type: "operation",
			content: { type: "textGeneration" },
		},
		inputId: "inp-id3Grof8Hyy3DJbN",
	},
] as Connection[];

// Setup helper variables
const nodeSet = new Set<Node>(sampleNodes);
const connectionSet = new Set<Connection>(sampleConnections);
const nodeIdSet = new Set<NodeId>(sampleNodes.map((node) => node.id));
const nodeRecord: Record<NodeId, Node> = Object.fromEntries(
	sampleNodes.map((node) => [node.id, node]),
);
const workflowId = "wf-N5RH1s46zdx3XjQj" as WorkflowId;

describe("buildConnectedNodeIdList", () => {
	test("should create a correct connection map for sample nodes", () => {
		const result = buildConnectedNodeIdList(connectionSet, nodeIdSet);

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(2); // Two nodes in our sample

		const map = new Map(result);
		const node1Connections = map.get("nd-KzXeXSIffRIMwZtX");
		expect(node1Connections).toBeInstanceOf(Set);
		expect(node1Connections?.size).toBe(1);
		expect(node1Connections?.has("nd-P2EllMigi6Tm6gij")).toBe(true);

		// Check node2 connections
		const node2Connections = map.get("nd-P2EllMigi6Tm6gij");
		expect(node2Connections).toBeInstanceOf(Set);
		expect(node2Connections?.size).toBe(1);
		expect(node2Connections?.has("nd-KzXeXSIffRIMwZtX")).toBe(true);
	});

	test("should handle empty connections", () => {
		const result = buildConnectedNodeIdList(new Set<Connection>(), nodeIdSet);
		expect(result.length).toBe(0);
	});
});

describe("collectConnectedNodes", () => {
	const connectedNodeIdList = buildConnectedNodeIdList(
		connectionSet,
		nodeIdSet,
	);

	test("should find all connected nodes starting from first node", () => {
		const result = collectConnectedNodes(
			"nd-KzXeXSIffRIMwZtX",
			nodeRecord,
			connectedNodeIdList,
		);

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(2); // Both nodes are connected
		const ids = result.map((n) => n.id);
		expect(ids).toContain("nd-KzXeXSIffRIMwZtX");
		expect(ids).toContain("nd-P2EllMigi6Tm6gij");
	});

	test("should find all connected nodes starting from second node", () => {
		const result = collectConnectedNodes(
			"nd-P2EllMigi6Tm6gij",
			nodeRecord,
			connectedNodeIdList,
		);

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(2); // Both nodes are connected
		const ids = result.map((n) => n.id);
		expect(ids).toContain("nd-KzXeXSIffRIMwZtX");
		expect(ids).toContain("nd-P2EllMigi6Tm6gij");
	});

	test("should handle non-existent starting node", () => {
		const result = collectConnectedNodes(
			"non-existent-node-id" as NodeId,
			nodeRecord,
			connectedNodeIdList,
		);

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(0);
	});
});

describe("collectConnectedConnections", () => {
	test("should find connections between connected nodes", () => {
		const connectedNodeIdList = buildConnectedNodeIdList(
			connectionSet,
			nodeIdSet,
		);
		const connectedNodes = collectConnectedNodes(
			"nd-KzXeXSIffRIMwZtX",
			nodeRecord,
			connectedNodeIdList,
		);

		const result = collectConnectedConnections(
			new Set(connectedNodes.map((n) => n.id)),
			connectionSet,
		);

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(1); // One connection in our sample
		expect(result[0].id).toBe("cnnc-7SZdtE1iSWtoghGD");
	});

	test("should handle empty node set", () => {
		const result = collectConnectedConnections(
			new Set<NodeId>(),
			connectionSet,
		);

		expect(result.length).toBe(0);
	});
});

describe("buildJobList", () => {
	test("should create jobs for the sample workflow", () => {
		const result = buildJobList(nodeSet, connectionSet, workflowId);

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(2); // Two jobs because of the dependency structure

		const jobsArray = result;

		// First job should contain the first node (which has no inputs)
		expect(jobsArray[0].workflowId).toBe(workflowId);
		expect(jobsArray[0].operations.length).toBe(1);
		expect(jobsArray[0].operations[0].node.id).toBe("nd-KzXeXSIffRIMwZtX");

		// Second job should contain the second node (which depends on the first)
		expect(jobsArray[1].workflowId).toBe(workflowId);
		expect(jobsArray[1].operations.length).toBe(1);
		expect(jobsArray[1].operations[0].node.id).toBe("nd-P2EllMigi6Tm6gij");

		// Check generation templates
		expect(jobsArray[0].operations[0].sourceNodes.length).toBe(0);
		expect(jobsArray[1].operations[0].sourceNodes.length).toBe(1);
		expect(jobsArray[1].operations[0].sourceNodes[0].id).toBe(
			"nd-KzXeXSIffRIMwZtX",
		);
	});

	test("should handle empty node set", () => {
		const result = buildJobList(new Set<Node>(), connectionSet, workflowId);

		expect(result.length).toBe(0);
	});
});

describe("Test with complex workflow", () => {
	// Sample data from user's example
	const complexNodes: Node[] = [
		{
			id: "nd-E89xeYnFyQUGxdCL",
			type: "operation",
			inputs: [],
			outputs: [
				{
					id: "otp-iK3fTc8uBJn2JFM8",
					label: "Output",
					accessor: "generated-text",
				},
				{
					id: "otp-178F8dUeKWPWlU6y",
					label: "Source",
					accessor: "source",
				},
			],
			content: {
				type: "textGeneration",
				llm: {
					provider: "perplexity",
					id: "sonar-pro",
					configurations: {
						temperature: 0.2,
						topP: 0.9,
						presencePenalty: 0,
						frequencyPenalty: 1,
					},
				},
			},
		},
		{
			id: "nd-daF6m8YshVoiBARi",
			name: "gemini-2.0-flash-0012",
			type: "operation",
			inputs: [
				{ id: "inp-rVg0GxYPFNnFUvJd", label: "Input" },
				{ id: "inp-xYV0iiqdumwxPOQR", label: "Input" },
			],
			outputs: [
				{
					id: "otp-B7rFjf3M6m14gN7R",
					label: "Output",
					accessor: "generated-text",
				},
			],
			content: {
				type: "textGeneration",
				llm: {
					provider: "google",
					id: "gemini-2.0-flash-001",
					configurations: {
						temperature: 0.7,
						topP: 1,
						searchGrounding: false,
					},
				},
			},
		},
		{
			id: "nd-ixIefYTHjZVhpEGq",
			type: "operation",
			inputs: [{ id: "inp-vZaOw0D8k9uyGNgp", label: "Input" }],
			outputs: [
				{
					id: "otp-yXSelwQUWs6DQrFl",
					label: "Output",
					accessor: "generated-text",
				},
			],
			content: {
				type: "textGeneration",
				llm: {
					provider: "google",
					id: "gemini-2.0-flash-001",
					configurations: {
						temperature: 0.7,
						topP: 1,
						searchGrounding: false,
					},
				},
			},
		},
	] as Node[];

	const complexConnections: Connection[] = [
		{
			id: "cnnc-KprKOaAqxL7TXeHZ",
			outputNode: {
				id: "nd-E89xeYnFyQUGxdCL",
				type: "operation",
				content: { type: "textGeneration" },
			},
			outputId: "otp-iK3fTc8uBJn2JFM8",
			inputNode: {
				id: "nd-daF6m8YshVoiBARi",
				type: "operation",
				content: { type: "textGeneration" },
			},
			inputId: "inp-rVg0GxYPFNnFUvJd",
		},
		{
			id: "cnnc-VWcUOOacadZQ2CMc",
			outputNode: {
				id: "nd-E89xeYnFyQUGxdCL",
				type: "operation",
				content: { type: "textGeneration" },
			},
			outputId: "otp-178F8dUeKWPWlU6y",
			inputNode: {
				id: "nd-daF6m8YshVoiBARi",
				type: "operation",
				content: { type: "textGeneration" },
			},
			inputId: "inp-xYV0iiqdumwxPOQR",
		},
		{
			id: "cnnc-pHNejzic6NKKxBsA",
			outputNode: {
				id: "nd-E89xeYnFyQUGxdCL",
				type: "operation",
				content: { type: "textGeneration" },
			},
			outputId: "otp-iK3fTc8uBJn2JFM8",
			inputNode: {
				id: "nd-ixIefYTHjZVhpEGq",
				type: "operation",
				content: { type: "textGeneration" },
			},
			inputId: "inp-vZaOw0D8k9uyGNgp",
		},
	] as Connection[];

	// Setup helper variables
	const complexNodeSet = new Set<Node>(complexNodes);
	const complexConnectionSet = new Set<Connection>(complexConnections);
	const complexNodeIdSet = new Set<NodeId>(complexNodes.map((node) => node.id));
	const complexNodeRecord: Record<NodeId, Node> = Object.fromEntries(
		complexNodes.map((node) => [node.id, node]),
	);
	const complexWorkflowId = "wf-fgEzJutLbpYu1Hj3" as WorkflowId;

	test("should create correct connected node id map for complex workflow", () => {
		const result = buildConnectedNodeIdList(
			complexConnectionSet,
			complexNodeIdSet,
		);

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(3); // Three nodes in our complex sample

		const map = new Map(result);
		const node1Connections = map.get("nd-E89xeYnFyQUGxdCL");
		expect(node1Connections).toBeInstanceOf(Set);
		expect(node1Connections?.size).toBe(2);
		expect(node1Connections?.has("nd-daF6m8YshVoiBARi")).toBe(true);
		expect(node1Connections?.has("nd-ixIefYTHjZVhpEGq")).toBe(true);

		// Check second node connections (input)
		const node2Connections = map.get("nd-daF6m8YshVoiBARi");
		expect(node2Connections).toBeInstanceOf(Set);
		expect(node2Connections?.size).toBe(1);
		expect(node2Connections?.has("nd-E89xeYnFyQUGxdCL")).toBe(true);

		// Check third node connections (input)
		const node3Connections = map.get("nd-ixIefYTHjZVhpEGq");
		expect(node3Connections).toBeInstanceOf(Set);
		expect(node3Connections?.size).toBe(1);
		expect(node3Connections?.has("nd-E89xeYnFyQUGxdCL")).toBe(true);
	});

	test("should find all connected nodes starting from source node", () => {
		const connectedNodeIdList = buildConnectedNodeIdList(
			complexConnectionSet,
			complexNodeIdSet,
		);
		const result = collectConnectedNodes(
			"nd-E89xeYnFyQUGxdCL",
			complexNodeRecord,
			connectedNodeIdList,
		);

		expect(Array.isArray(result)).toBe(true);
		expect(result.length).toBe(3); // All nodes are connected
		const ids = result.map((n) => n.id);
		expect(ids).toContain("nd-E89xeYnFyQUGxdCL");
		expect(ids).toContain("nd-daF6m8YshVoiBARi");
		expect(ids).toContain("nd-ixIefYTHjZVhpEGq");
	});

	test("should create correct job map for complex workflow", () => {
		const result = buildJobList(
			complexNodeSet,
			complexConnectionSet,
			complexWorkflowId,
		);

		const jobsArray = result;

		expect(result.length).toBe(2); // Two jobs: one for source node and one for dependent nodes

		// First job should contain the first node (which has no inputs)
		expect(jobsArray[0].workflowId).toBe(complexWorkflowId);
		expect(jobsArray[0].operations.length).toBe(1);
		expect(jobsArray[0].operations[0].node.id).toBe("nd-E89xeYnFyQUGxdCL");

		// Second job should contain both dependent nodes
		expect(jobsArray[1].workflowId).toBe(complexWorkflowId);
		expect(jobsArray[1].operations.length).toBe(2);

		// Get the node IDs from the second job
		const secondJobNodeIds = jobsArray[1].operations
			.map((operation) => operation.node.id)
			.sort();
		expect(secondJobNodeIds).toEqual(
			["nd-daF6m8YshVoiBARi", "nd-ixIefYTHjZVhpEGq"].sort(),
		);

		// Check generation templates for first job
		expect(jobsArray[0].operations[0].sourceNodes.length).toBe(0);

		// Check generation templates for second job nodes
		// Find the node with id nd-ixIefYTHjZVhpEGq
		const ixIefYTHjZVhpEGqNode = jobsArray[1].operations.find(
			(operation) => operation.node.id === "nd-ixIefYTHjZVhpEGq",
		);
		expect(ixIefYTHjZVhpEGqNode?.sourceNodes.length).toBe(1);
		expect(ixIefYTHjZVhpEGqNode?.sourceNodes[0].id).toBe("nd-E89xeYnFyQUGxdCL");

		// Find the node with id nd-daF6m8YshVoiBARi
		const daF6m8YshVoiBARiNode = jobsArray[1].operations.find(
			(operation) => operation.node.id === "nd-daF6m8YshVoiBARi",
		);
		expect(daF6m8YshVoiBARiNode?.sourceNodes.length).toBe(2);
		expect(daF6m8YshVoiBARiNode?.sourceNodes[0].id).toBe("nd-E89xeYnFyQUGxdCL");
		expect(daF6m8YshVoiBARiNode?.sourceNodes[1].id).toBe("nd-E89xeYnFyQUGxdCL");
	});
});
