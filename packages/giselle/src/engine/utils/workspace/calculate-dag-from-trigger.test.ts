import { Workspace } from "@giselle-sdk/data-type";
import { describe, expect, it } from "vitest";
import workspace1 from "../__fixtures__/workspace1.json";
import workspace2 from "../__fixtures__/workspace2.json";
import workspace3 from "../__fixtures__/workspace3.json";
import { testWorkspace1 } from "../workflow/test/test-data";
import { calculateDAGFromTrigger } from "./calculate-dag-from-trigger";

describe("calculateDAGFromTrigger", () => {
	it("should return only the trigger node when no connections exist", () => {
		const triggerNodeId = "nd-y7lLktmBplRvcSov"; // Manual trigger from fixture

		// Pass empty connections array to test when no connections exist
		const result = calculateDAGFromTrigger(triggerNodeId, []);

		expect(result.nodeIds).toEqual([triggerNodeId]);
		expect(result.connectionIds).toEqual([]);
	});

	it("should traverse all nodes connected downstream from trigger", () => {
		const triggerNodeId = "nd-y7lLktmBplRvcSov"; // Manual trigger from fixture

		const result = calculateDAGFromTrigger(
			triggerNodeId,
			testWorkspace1.connections,
		);

		// Based on the test data structure:
		// Manual trigger -> nd-7cHfwxtERI9CPAIt -> nd-1aXA3izp1yV48mPH
		expect(result.nodeIds).toContain(triggerNodeId);
		expect(result.nodeIds).toContain("nd-7cHfwxtERI9CPAIt"); // First text generation node
		expect(result.nodeIds).toContain("nd-1aXA3izp1yV48mPH"); // Second text generation node
		expect(result.nodeIds).toHaveLength(3);

		// Should include the connections between them
		expect(result.connectionIds).toContain("cnnc-1noJE3niIVUFrSQV"); // trigger -> first node
		expect(result.connectionIds).toContain("cnnc-p00GOBR89Pukcgvg"); // first -> second node
		expect(result.connectionIds).toHaveLength(2);
	});

	it("should not include nodes from unconnected trigger", () => {
		const triggerNodeId = "nd-y7lLktmBplRvcSov"; // Manual trigger

		const result = calculateDAGFromTrigger(
			triggerNodeId,
			testWorkspace1.connections,
		);

		// Should not include nodes from the GitHub trigger subgraph
		expect(result.nodeIds).not.toContain("nd-jm0L6gvHk4U0eAlz"); // GitHub trigger
		expect(result.nodeIds).not.toContain("nd-4KPG1AiUA0mGN94i"); // Text node connected to GitHub trigger
	});

	it("should handle node with downstream connections", () => {
		// nd-bDa47yWhthNtESN1 connects to nd-d4TuvXgSOSkY5zQQ
		const nodeId = "nd-bDa47yWhthNtESN1";

		const result = calculateDAGFromTrigger(nodeId, testWorkspace1.connections);

		expect(result.nodeIds).toContain(nodeId);
		expect(result.nodeIds).toContain("nd-d4TuvXgSOSkY5zQQ");
		expect(result.nodeIds).toHaveLength(2);

		expect(result.connectionIds).toContain("cnnc-cGgJsDrM2QNMubR4");
		expect(result.connectionIds).toHaveLength(1);
	});

	it("should handle nodes with no downstream connections", () => {
		// Use nd-d4TuvXgSOSkY5zQQ which has no outgoing connections
		const leafNodeId = "nd-d4TuvXgSOSkY5zQQ";

		const result = calculateDAGFromTrigger(
			leafNodeId,
			testWorkspace1.connections,
		);

		expect(result.nodeIds).toEqual([leafNodeId]);
		expect(result.connectionIds).toEqual([]);
	});

	it("should traverse entire GitHub trigger chain", () => {
		const githubTriggerId = "nd-jm0L6gvHk4U0eAlz";

		const result = calculateDAGFromTrigger(
			githubTriggerId,
			testWorkspace1.connections,
		);

		// GitHub trigger connects to one text generation node
		expect(result.nodeIds).toContain(githubTriggerId);
		expect(result.nodeIds).toContain("nd-4KPG1AiUA0mGN94i");
		expect(result.nodeIds).toHaveLength(2);

		expect(result.connectionIds).toContain("cnnc-voTSCaRTEYgpGT1N");
		expect(result.connectionIds).toHaveLength(1);
	});
});

describe("calculateDAGFromTrigger with fixture/workspace1", () => {
	it("should return DAG from Manual trigger node", () => {
		const workspace = Workspace.safeParse(workspace1);
		expect(workspace.success).toBeTruthy();
		if (!workspace.success) {
			throw new Error("Failed to parse workspace1");
		}

		const triggerNodeId = "nd-qRt17h0TP7nQd4Xk"; // Manual trigger

		const result = calculateDAGFromTrigger(
			triggerNodeId,
			workspace.data.connections,
		);

		// Should include 3 nodes: Manual trigger, Text Generation, GitHub action
		expect(result.nodeIds).toHaveLength(3);
		expect(result.nodeIds).toContain("nd-qRt17h0TP7nQd4Xk"); // Manual trigger
		expect(result.nodeIds).toContain("nd-LsNVgNj3s1xJjreL"); // Text Generation
		expect(result.nodeIds).toContain("nd-c2tg86XNmMef5SUj"); // GitHub action

		// Should include 3 connections
		expect(result.connectionIds).toHaveLength(3);
		expect(result.connectionIds).toContain("cnnc-17r6tr11TxLUptRh"); // trigger -> text generation
		expect(result.connectionIds).toContain("cnnc-CUkGxtnuRw7Bciag"); // text generation -> action
		expect(result.connectionIds).toContain("cnnc-w3Ma5Nl0dhZPkNWg"); // another connection from trigger
	});

	it("should not include unconnected nodes", () => {
		const workspace = Workspace.safeParse(workspace1);
		expect(workspace.success).toBeTruthy();
		if (!workspace.success) {
			throw new Error("Failed to parse workspace1");
		}

		const triggerNodeId = "nd-qRt17h0TP7nQd4Xk";

		const result = calculateDAGFromTrigger(
			triggerNodeId,
			workspace.data.connections,
		);

		// In workspace1, all nodes are connected, so there are no unconnected nodes
		const allNodeIds = workspace.data.nodes.map((n) => n.id);
		const unconnectedNodeIds = allNodeIds.filter(
			(id) => !result.nodeIds.includes(id),
		);

		// Verify that all nodes are included (no unconnected nodes in workspace1)
		expect(unconnectedNodeIds.length).toBe(0);
	});
});

describe("calculateDAGFromTrigger with fixture/workspace2", () => {
	it("should return DAG from GitHub trigger node", () => {
		const workspace = Workspace.safeParse(workspace2);
		expect(workspace.success).toBeTruthy();
		if (!workspace.success) {
			throw new Error("Failed to parse workspace2");
		}

		const triggerNodeId = "nd-Z6YHBDO456UNY6N4"; // GitHub trigger "On Issue Comment Created"

		const result = calculateDAGFromTrigger(
			triggerNodeId,
			workspace.data.connections,
		);

		// Should include 3 nodes: GitHub trigger, Text generation, GitHub action
		expect(result.nodeIds).toHaveLength(3);
		expect(result.nodeIds).toContain("nd-Z6YHBDO456UNY6N4"); // GitHub trigger
		expect(result.nodeIds).toContain("nd-Q68VP2EDCXck0DZg"); // Text generation
		expect(result.nodeIds).toContain("nd-9erM0USHKLZVTMsL"); // GitHub action

		// Should include 3 connections
		expect(result.connectionIds).toHaveLength(3);
		expect(result.connectionIds).toContain("cnnc-lWrL2aNIqywaoTTb"); // trigger -> text generation
		expect(result.connectionIds).toContain("cnnc-4ZtPypOts5zUOp5E"); // text generation -> action
		expect(result.connectionIds).toContain("cnnc-2ZaaHTDvkMyegOIQ"); // trigger -> action
	});

	it("should handle correct flow from trigger through all connected nodes", () => {
		const workspace = Workspace.safeParse(workspace2);
		expect(workspace.success).toBeTruthy();
		if (!workspace.success) {
			throw new Error("Failed to parse workspace2");
		}

		const triggerNodeId = "nd-Z6YHBDO456UNY6N4";

		const result = calculateDAGFromTrigger(
			triggerNodeId,
			workspace.data.connections,
		);

		// Verify the result contains expected connections
		expect(result.connectionIds).toContain("cnnc-lWrL2aNIqywaoTTb");
		expect(result.connectionIds).toContain("cnnc-4ZtPypOts5zUOp5E");
		expect(result.connectionIds).toContain("cnnc-2ZaaHTDvkMyegOIQ");

		// Verify the connections form the expected path
		const triggerToTextConnection = workspace.data.connections.find(
			(c) =>
				c.outputNode.id === triggerNodeId && c.id === "cnnc-lWrL2aNIqywaoTTb",
		);
		expect(triggerToTextConnection).toBeDefined();
		expect(triggerToTextConnection?.inputNode.id).toBe("nd-Q68VP2EDCXck0DZg");

		const textToActionConnection = workspace.data.connections.find(
			(c) =>
				c.outputNode.id === "nd-Q68VP2EDCXck0DZg" &&
				c.id === "cnnc-4ZtPypOts5zUOp5E",
		);
		expect(textToActionConnection).toBeDefined();
		expect(textToActionConnection?.inputNode.id).toBe("nd-9erM0USHKLZVTMsL");
	});
});

describe("calculateDAGFromTrigger with fixture/workspace3", () => {
	it("should return DAG from starting node", () => {
		const workspace = Workspace.safeParse(workspace3);
		expect(workspace.success).toBeTruthy();
		if (!workspace.success) {
			throw new Error("Failed to parse workspace3");
		}

		const startNodeId = "nd-3k5o1XHYgJIuVE9z";

		const result = calculateDAGFromTrigger(
			startNodeId,
			workspace.data.connections,
		);

		// Should include the trigger node and all downstream nodes
		expect(result.nodeIds).toContain(startNodeId);

		// Find all connections that start from this node
		const downstreamConnections = workspace.data.connections.filter(
			(c) => c.outputNode.id === startNodeId,
		);

		// Include all downstream connections
		downstreamConnections.forEach((conn) => {
			expect(result.connectionIds).toContain(conn.id);
			expect(result.nodeIds).toContain(conn.inputNode.id);
		});
	});

	it("should include correct number of nodes and connections", () => {
		const workspace = Workspace.safeParse(workspace3);
		expect(workspace.success).toBeTruthy();
		if (!workspace.success) {
			throw new Error("Failed to parse workspace3");
		}

		const startNodeId = "nd-3k5o1XHYgJIuVE9z";

		const result = calculateDAGFromTrigger(
			startNodeId,
			workspace.data.connections,
		);

		// Based on the test in build-workflow-from-node.test.ts,
		// workspace3 should have 2 sequences when starting from this node
		// This means at least 2 nodes and 1 connection
		expect(result.nodeIds.length).toBeGreaterThanOrEqual(2);
		expect(result.connectionIds.length).toBeGreaterThanOrEqual(1);

		// Verify the starting node is included
		expect(result.nodeIds).toContain(startNodeId);
	});
});
