import type {
	Connection,
	ConnectionId,
	Node,
	NodeId,
} from "@giselle-sdk/data-type";
import { describe, expect, test } from "vitest";
import { buildWorkflowFromNode } from "./build-workflow";

// Sample data for tests
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
	{
		id: "nd-NonOperationNode",
		type: "data",
		inputs: [],
		outputs: [],
		content: { type: "data" },
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
const nodeMap = new Map<NodeId, Node>(
	sampleNodes.map((node) => [node.id, node]),
);
const connectionMap = new Map<ConnectionId, Connection>(
	sampleConnections.map((connection) => [connection.id, connection]),
);

describe("buildWorkflowFromNode", () => {
	test("should create a workflow starting from the first node", () => {
		const result = buildWorkflowFromNode(
			"nd-KzXeXSIffRIMwZtX",
			nodeMap,
			connectionMap,
		);

		expect(result).not.toBeNull();
		if (result) {
			// Check workflow structure
			expect(result.nodes.length).toBe(2); // Two nodes in our workflow
			expect(result.jobs.length).toBe(2); // Two jobs because of the dependency structure

			// Check if nodes are included in the workflow
			const nodeIds = result.nodes.map((node) => node.id);
			expect(nodeIds).toContain("nd-KzXeXSIffRIMwZtX");
			expect(nodeIds).toContain("nd-P2EllMigi6Tm6gij");

			// Check job structure
			const jobsWithFirstNode = result.jobs.filter((job) =>
				job.operations.some(
					(operation) => operation.node.id === "nd-KzXeXSIffRIMwZtX",
				),
			);
			const jobsWithSecondNode = result.jobs.filter((job) =>
				job.operations.some(
					(operation) => operation.node.id === "nd-P2EllMigi6Tm6gij",
				),
			);

			expect(jobsWithFirstNode.length).toBe(1);
			expect(jobsWithSecondNode.length).toBe(1);

			// Check dependency relationship in generation templates
			const secondNodeJob = jobsWithSecondNode[0];
			expect(
				secondNodeJob.operations[0].generationTemplate.sourceNodes.length,
			).toBe(1);
			expect(
				secondNodeJob.operations[0].generationTemplate.sourceNodes[0].id,
			).toBe("nd-KzXeXSIffRIMwZtX");
		}
	});

	test("should create a workflow starting from the second node", () => {
		const result = buildWorkflowFromNode(
			"nd-P2EllMigi6Tm6gij",
			nodeMap,
			connectionMap,
		);

		expect(result).not.toBeNull();
		if (result) {
			// Check workflow structure
			expect(result.nodes.length).toBe(2); // Two nodes in our workflow
			expect(result.jobs.length).toBe(2); // Two jobs because of the dependency structure

			// Check if nodes are included in the workflow
			const nodeIds = result.nodes.map((node) => node.id);
			expect(nodeIds).toContain("nd-KzXeXSIffRIMwZtX");
			expect(nodeIds).toContain("nd-P2EllMigi6Tm6gij");
		}
	});

	test("should return null when starting from a non-operation node", () => {
		const result = buildWorkflowFromNode(
			"nd-NonOperationNode",
			nodeMap,
			connectionMap,
		);

		expect(result).toBeNull();
	});

	test("should return null when starting from a non-existent node", () => {
		const result = buildWorkflowFromNode(
			"nd-NonExistentNode" as NodeId,
			nodeMap,
			connectionMap,
		);

		expect(result).toBeNull();
	});

	test("should handle complex workflow starting from source node", () => {
		// Sample data from complex workflow example
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

		// Setup maps
		const complexNodeMap = new Map<NodeId, Node>(
			complexNodes.map((node) => [node.id, node]),
		);
		const complexConnectionMap = new Map<ConnectionId, Connection>(
			complexConnections.map((connection) => [connection.id, connection]),
		);

		const result = buildWorkflowFromNode(
			"nd-E89xeYnFyQUGxdCL",
			complexNodeMap,
			complexConnectionMap,
		);

		expect(result).not.toBeNull();
		if (result) {
			// Check workflow structure
			expect(result.nodes.length).toBe(3); // Three nodes in our workflow
			expect(result.jobs.length).toBe(2); // Two jobs

			// Check if nodes are included in the workflow
			const nodeIds = result.nodes.map((node) => node.id).sort();
			expect(nodeIds).toEqual(
				[
					"nd-E89xeYnFyQUGxdCL",
					"nd-daF6m8YshVoiBARi",
					"nd-ixIefYTHjZVhpEGq",
				].sort(),
			);

			// The first job should be the source node
			expect(result.jobs[0].operations.length).toBe(1);
			expect(result.jobs[0].operations[0].node.id).toBe("nd-E89xeYnFyQUGxdCL");

			// The second job should contain both dependent nodes
			expect(result.jobs[1].operations.length).toBe(2);

			// Get both nodes IDs from the second job
			const secondJobNodeIds = result.jobs[1].operations
				.map((operation) => operation.node.id)
				.sort();

			expect(secondJobNodeIds).toEqual(
				["nd-daF6m8YshVoiBARi", "nd-ixIefYTHjZVhpEGq"].sort(),
			);
		}
	});
});
