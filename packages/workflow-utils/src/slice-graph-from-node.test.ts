import { describe, expect, test } from "vitest";
import { sliceGraphFromNode } from "./slice-graph-from-node";
import { testWorkspace1 } from "./test/test-data";

describe("slice-graph-from-node", () => {
	describe("test with testWorkspace1", () => {
		describe("start with nd-y7lLktmBplRvcSov", () => {
			const startNode = testWorkspace1.nodes.find(
				(node) => node.id === "nd-y7lLktmBplRvcSov",
			);
			if (startNode === undefined) {
				throw new Error("startNode is undefined");
			}
			const { nodes } = sliceGraphFromNode(startNode, testWorkspace1);
			test("should has three nodes", () => {
				expect(nodes).toHaveLength(3);
			});
		});
	});
});
