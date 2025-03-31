import type {
	Connection,
	ConnectionId,
	Node,
	NodeId,
	WorkflowId,
} from "@giselle-sdk/data-type";
import { describe, expect, test } from "vitest";
import { buildWorkflowMap } from "./build-workflow";

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
const nodeMap = new Map<NodeId, Node>(
	sampleNodes.map((node) => [node.id, node]),
);
const connectionMap = new Map<ConnectionId, Connection>(
	sampleConnections.map((connection) => [connection.id, connection]),
);

describe("buildWorkflowMap", () => {
	test("should create a workflow map from sample nodes and connections", () => {
		const result = buildWorkflowMap(nodeMap, connectionMap);

		expect(result).toBeInstanceOf(Map);
		expect(result.size).toBe(1); // One workflow in our sample

		// Get the workflow from the map
		const workflow = Array.from(result.values())[0];

		// Check workflow structure
		expect(workflow.nodes.length).toBe(2); // Two nodes in our workflow
		expect(workflow.jobs.length).toBe(2); // Two jobs because of the dependency structure

		// Check if nodes are included in the workflow
		const nodeIds = workflow.nodes.map((node) => node.id);
		expect(nodeIds).toContain("nd-KzXeXSIffRIMwZtX");
		expect(nodeIds).toContain("nd-P2EllMigi6Tm6gij");

		// Check job structure
		const jobsWithFirstNode = workflow.jobs.filter((job) =>
			job.actions.some((action) => action.node.id === "nd-KzXeXSIffRIMwZtX"),
		);
		const jobsWithSecondNode = workflow.jobs.filter((job) =>
			job.actions.some((action) => action.node.id === "nd-P2EllMigi6Tm6gij"),
		);

		expect(jobsWithFirstNode.length).toBe(1);
		expect(jobsWithSecondNode.length).toBe(1);

		// Check dependency relationship in generation templates
		const secondNodeJob = jobsWithSecondNode[0];
		expect(secondNodeJob.actions[0].generationTemplate.sourceNodes.length).toBe(
			1,
		);
		expect(secondNodeJob.actions[0].generationTemplate.sourceNodes[0].id).toBe(
			"nd-KzXeXSIffRIMwZtX",
		);
	});

	test("should handle empty maps", () => {
		const emptyNodeMap = new Map<NodeId, Node>();
		const emptyConnectionMap = new Map<ConnectionId, Connection>();

		const result = buildWorkflowMap(emptyNodeMap, emptyConnectionMap);

		expect(result).toBeInstanceOf(Map);
		expect(result.size).toBe(0);
	});

	test("should handle maps with only non-action nodes", () => {
		const nonActionNode: Node = {
			id: "nd-NonAction",
			type: "data",
			inputs: [],
			outputs: [],
			content: { type: "data" },
		} as unknown as Node;

		const nonActionNodeMap = new Map<NodeId, Node>([
			["nd-NonAction", nonActionNode],
		]);

		const result = buildWorkflowMap(nonActionNodeMap, connectionMap);

		expect(result).toBeInstanceOf(Map);
		expect(result.size).toBe(0);
	});
});
