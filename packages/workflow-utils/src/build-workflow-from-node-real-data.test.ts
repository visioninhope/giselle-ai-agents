import type {
	Connection,
	ConnectionId,
	Node,
	NodeId,
} from "@giselle-sdk/data-type";
import { describe, expect, test } from "vitest";
import { buildWorkflowFromNode } from "./build-workflow";

// Real workflow data provided by the user
const workflowData = {
	id: "wrks-y9HldH2r4OzHlKhd",
	schemaVersion: "20250221",
	nodes: [
		{
			id: "nd-1aXA3izp1yV48mPH",
			type: "operation",
			inputs: [{ id: "inp-ToOWmAN6dIhY1Qxa", label: "Input" }],
			outputs: [
				{
					id: "otp-ohaEJR2OU3n8vool",
					label: "Output",
					accessor: "generated-text",
				},
			],
			content: {
				type: "textGeneration",
				llm: {
					provider: "google",
					id: "gemini-2.0-flash",
					configurations: {
						temperature: 0.7,
						topP: 1,
						searchGrounding: false,
					},
				},
			},
		},
		{
			id: "nd-y7lLktmBplRvcSov",
			name: "Manual trigger",
			type: "operation",
			inputs: [],
			outputs: [
				{
					id: "otp-CJwRfFHF6gU3Q527",
					label: "Output",
					accessor: "Output",
				},
			],
			content: {
				type: "trigger",
				provider: {
					type: "manual",
					triggerId: "manual",
				},
			},
		},
		{
			id: "nd-7cHfwxtERI9CPAIt",
			type: "operation",
			inputs: [{ id: "inp-kSYSroXpYCjVx4VL", label: "Input" }],
			outputs: [
				{
					id: "otp-4G1uIyUg1OzinQas",
					label: "Output",
					accessor: "generated-text",
				},
			],
			content: {
				type: "textGeneration",
				llm: {
					provider: "google",
					id: "gemini-2.0-flash",
					configurations: {
						temperature: 0.7,
						topP: 1,
						searchGrounding: false,
					},
				},
				prompt:
					'{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello"}]}]}',
			},
		},
		{
			id: "nd-bDa47yWhthNtESN1",
			type: "operation",
			inputs: [],
			outputs: [
				{
					id: "otp-HZphv951HS7rMftJ",
					label: "Output",
					accessor: "generated-text",
				},
			],
			content: {
				type: "textGeneration",
				llm: {
					provider: "google",
					id: "gemini-2.5-pro-preview-03-25",
					configurations: {
						temperature: 0.7,
						topP: 1,
						searchGrounding: false,
					},
				},
			},
		},
		{
			id: "nd-d4TuvXgSOSkY5zQQ",
			type: "operation",
			inputs: [{ id: "inp-ZODlnwVgQhZ0VTWT", label: "Input" }],
			outputs: [
				{
					id: "otp-DUX9IRy7YDPTNWGC",
					label: "Output",
					accessor: "generated-text",
				},
			],
			content: {
				type: "textGeneration",
				llm: {
					provider: "google",
					id: "gemini-2.0-flash",
					configurations: {
						temperature: 0.7,
						topP: 1,
						searchGrounding: false,
					},
				},
			},
		},
		{
			id: "nd-jm0L6gvHk4U0eAlz",
			name: "Created an issue",
			type: "operation",
			inputs: [],
			outputs: [
				{ id: "otp-ZxwqRRcamCukeLlX", label: "title", accessor: "title" },
				{ id: "otp-J2FN10NGnFaRJhHV", label: "body", accessor: "body" },
				{
					id: "otp-SZWyvY9t4YfDQDEO",
					label: "repositoryOwner",
					accessor: "repositoryOwner",
				},
				{
					id: "otp-Ma5sUrj3pb2SIzC3",
					label: "repositoryName",
					accessor: "repositoryName",
				},
			],
			content: {
				type: "trigger",
				provider: {
					type: "github",
					triggerId: "github.issue.created",
					auth: { state: "unauthenticated" },
				},
			},
		},
		{
			id: "nd-4KPG1AiUA0mGN94i",
			type: "operation",
			inputs: [{ id: "inp-76KjIOKSj4XNuN7w", label: "Input" }],
			outputs: [
				{
					id: "otp-fYw3FbHY116UcPIE",
					label: "Output",
					accessor: "generated-text",
				},
			],
			content: {
				type: "textGeneration",
				llm: {
					provider: "openai",
					id: "gpt-4o",
					configurations: {
						temperature: 0.7,
						topP: 1,
						presencePenalty: 0,
						frequencyPenalty: 0,
					},
				},
			},
		},
	],
	connections: [
		{
			id: "cnnc-p00GOBR89Pukcgvg",
			outputNode: {
				id: "nd-7cHfwxtERI9CPAIt",
				type: "operation",
				content: { type: "textGeneration" },
			},
			outputId: "otp-4G1uIyUg1OzinQas",
			inputNode: {
				id: "nd-1aXA3izp1yV48mPH",
				type: "operation",
				content: { type: "textGeneration" },
			},
			inputId: "inp-ToOWmAN6dIhY1Qxa",
		},
		{
			id: "cnnc-1noJE3niIVUFrSQV",
			outputNode: {
				id: "nd-y7lLktmBplRvcSov",
				type: "operation",
				content: { type: "trigger" },
			},
			outputId: "otp-CJwRfFHF6gU3Q527",
			inputNode: {
				id: "nd-7cHfwxtERI9CPAIt",
				type: "operation",
				content: { type: "textGeneration" },
			},
			inputId: "inp-kSYSroXpYCjVx4VL",
		},
		{
			id: "cnnc-cGgJsDrM2QNMubR4",
			outputNode: {
				id: "nd-bDa47yWhthNtESN1",
				type: "operation",
				content: { type: "textGeneration" },
			},
			outputId: "otp-HZphv951HS7rMftJ",
			inputNode: {
				id: "nd-d4TuvXgSOSkY5zQQ",
				type: "operation",
				content: { type: "textGeneration" },
			},
			inputId: "inp-ZODlnwVgQhZ0VTWT",
		},
		{
			id: "cnnc-voTSCaRTEYgpGT1N",
			outputNode: {
				id: "nd-jm0L6gvHk4U0eAlz",
				type: "operation",
				content: { type: "trigger" },
			},
			outputId: "otp-ZxwqRRcamCukeLlX",
			inputNode: {
				id: "nd-4KPG1AiUA0mGN94i",
				type: "operation",
				content: { type: "textGeneration" },
			},
			inputId: "inp-76KjIOKSj4XNuN7w",
		},
	],
};

describe("buildWorkflowFromNode with real workflow data", () => {
	test("should build a workflow starting from Manual trigger node (nd-y7lLktmBplRvcSov)", () => {
		// Create node and connection maps from the workflow data
		const nodeMap = new Map<NodeId, Node>(
			workflowData.nodes.map((node) => [node.id as NodeId, node as Node]),
		);
		const connectionMap = new Map<ConnectionId, Connection>(
			workflowData.connections.map((connection) => [
				connection.id as ConnectionId,
				connection as Connection,
			]),
		);

		// Starting node is the Manual trigger
		const startNodeId = "nd-y7lLktmBplRvcSov" as NodeId;

		// Build the workflow starting from the Manual trigger node
		const result = buildWorkflowFromNode(startNodeId, nodeMap, connectionMap);

		expect(result).not.toBeNull();
		if (result) {
			// Check workflow structure
			// The workflow should contain 3 nodes: Manual trigger, Text Generation, Text Generation
			expect(result.nodes.length).toBe(3);

			// The workflow should have 3 jobs, one for each node in the correct order
			expect(result.jobs.length).toBe(3);

			// Check if specific nodes are included in the workflow
			const nodeIds = result.nodes.map((node) => node.id).sort();
			expect(nodeIds).toContain("nd-y7lLktmBplRvcSov"); // Manual trigger
			expect(nodeIds).toContain("nd-7cHfwxtERI9CPAIt"); // Text Generation node
			expect(nodeIds).toContain("nd-1aXA3izp1yV48mPH"); // Text Generation node

			// Should not include nodes from other workflows
			expect(nodeIds).not.toContain("nd-bDa47yWhthNtESN1"); // From different workflow
			expect(nodeIds).not.toContain("nd-d4TuvXgSOSkY5zQQ"); // From different workflow
			expect(nodeIds).not.toContain("nd-jm0L6gvHk4U0eAlz"); // From different workflow
			expect(nodeIds).not.toContain("nd-4KPG1AiUA0mGN94i"); // From different workflow

			// Check job dependencies
			// First job should be the Manual trigger node
			const job1 = result.jobs[0];
			expect(job1.operations.length).toBe(1);
			expect(job1.operations[0].node.id).toBe("nd-y7lLktmBplRvcSov");
			expect(job1.operations[0].generationTemplate.sourceNodes.length).toBe(0);

			// Second job should be the first Text Generation node
			const job2 = result.jobs[1];
			expect(job2.operations.length).toBe(1);
			expect(job2.operations[0].node.id).toBe("nd-7cHfwxtERI9CPAIt");
			expect(job2.operations[0].generationTemplate.sourceNodes.length).toBe(1);
			expect(job2.operations[0].generationTemplate.sourceNodes[0].id).toBe(
				"nd-y7lLktmBplRvcSov",
			);

			// Third job should be the second Text Generation node
			const job3 = result.jobs[2];
			expect(job3.operations.length).toBe(1);
			expect(job3.operations[0].node.id).toBe("nd-1aXA3izp1yV48mPH");
			expect(job3.operations[0].generationTemplate.sourceNodes.length).toBe(1);
			expect(job3.operations[0].generationTemplate.sourceNodes[0].id).toBe(
				"nd-7cHfwxtERI9CPAIt",
			);
		}
	});
});
