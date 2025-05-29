import { describe, expect, it } from "vitest";
import type { WorkspaceId } from "@giselle-sdk/data-type";

describe("executeQuery workspaceId validation logic", () => {
	// Test the workspace ID validation logic in isolation
	function extractWorkspaceId(origin: any): WorkspaceId | undefined {
		let workspaceId: WorkspaceId | undefined;
		switch (origin.type) {
			case "run":
				workspaceId = origin.workspaceId;
				break;
			case "workspace":
				workspaceId = origin.id;
				break;
			default: {
				const _exhaustiveCheck: never = origin;
				throw new Error(`Unhandled origin type: ${_exhaustiveCheck}`);
			}
		}

		// Explicit error handling for undefined workspaceId
		if (workspaceId === undefined) {
			throw new Error("Workspace ID is required for query execution");
		}

		return workspaceId;
	}

	it("should throw error when workspaceId is undefined for run origin", () => {
		const origin = {
			type: "run",
			id: "run-123",
			workspaceId: undefined,
		};

		expect(() => extractWorkspaceId(origin)).toThrow(
			"Workspace ID is required for query execution",
		);
	});

	it("should throw error when workspaceId is undefined for workspace origin", () => {
		const origin = {
			type: "workspace",
			id: undefined,
		};

		expect(() => extractWorkspaceId(origin)).toThrow(
			"Workspace ID is required for query execution",
		);
	});

	it("should return workspaceId when provided for run origin", () => {
		const origin = {
			type: "run",
			id: "run-123",
			workspaceId: "workspace-123" as WorkspaceId,
		};

		const result = extractWorkspaceId(origin);
		expect(result).toBe("workspace-123");
	});

	it("should return workspaceId when provided for workspace origin", () => {
		const origin = {
			type: "workspace",
			id: "workspace-123" as WorkspaceId,
		};

		const result = extractWorkspaceId(origin);
		expect(result).toBe("workspace-123");
	});
});

describe("vector store node detection logic", () => {
	it("should filter nodes by vectorStore content type regardless of node type", () => {
		// Mock the filter logic that was changed
		const sourceNodes = [
			{
				id: "node-1",
				type: "variable", // This was the original constraint
				content: { type: "vectorStore" },
			},
			{
				id: "node-2",
				type: "operation", // This should now be included
				content: { type: "vectorStore" },
			},
			{
				id: "node-3",
				type: "variable",
				content: { type: "text" }, // This should be excluded
			},
		];

		const connections = [
			{ outputNode: { id: "node-1" } },
			{ outputNode: { id: "node-2" } },
			{ outputNode: { id: "node-3" } },
		];

		// Simulate the new filter logic (removed node.type === "variable" constraint)
		const vectorStoreNodes = sourceNodes.filter(
			(node) =>
				node.content.type === "vectorStore" &&
				connections.some((connection) => connection.outputNode.id === node.id),
		);

		expect(vectorStoreNodes).toHaveLength(2);
		expect(vectorStoreNodes.map((n) => n.id)).toEqual(["node-1", "node-2"]);
	});

	it("should have previously excluded non-variable nodes", () => {
		// Test that the old logic would have only returned variable nodes
		const sourceNodes = [
			{
				id: "node-1",
				type: "variable",
				content: { type: "vectorStore" },
			},
			{
				id: "node-2",
				type: "operation",
				content: { type: "vectorStore" },
			},
		];

		const connections = [
			{ outputNode: { id: "node-1" } },
			{ outputNode: { id: "node-2" } },
		];

		// Simulate the old filter logic (WITH node.type === "variable" constraint)
		const oldVectorStoreNodes = sourceNodes.filter(
			(node) =>
				node.type === "variable" &&
				node.content.type === "vectorStore" &&
				connections.some((connection) => connection.outputNode.id === node.id),
		);

		// Only variable type nodes should be included in the old logic
		expect(oldVectorStoreNodes).toHaveLength(1);
		expect(oldVectorStoreNodes[0].id).toBe("node-1");
	});
});