import { describe, expect, it } from "vitest";
import { workspace1 } from "./__fixtures__/workspace1";
import { groupNodes } from "./group-nodes";

describe("groupNodes", () => {
	it("should group connected nodes in workspace1", () => {
		const groups = groupNodes(workspace1);

		// Sort groups by size for consistent testing
		const sortedGroups = groups
			.map((group) => group.sort())
			.sort((a, b) => b.length - a.length);

		// Based on the connections in workspace1:
		// Group 1: CFgMwrVsMDKy68ju -> GSCigvQfU7lbDsvy -> k7ii9Cge2s9XF5JF <- 7bpl4Q81Z97VgDlt <- OEac8DMOLd0bwsOe
		//          omdTu2flqJHhMuo8 -> GSCigvQfU7lbDsvy -> w0tHiwkN3n2ZIP2v
		//          Y7Uh3GvPRIQwfSGE -> omdTu2flqJHhMuo8
		// Group 2: CH7NalFDDDbHQcr7 -> YkXO5rkuczwTmnmv

		expect(sortedGroups).toHaveLength(2);

		// Verify the large connected component has 8 nodes
		expect(sortedGroups[0]).toHaveLength(8);
		expect(sortedGroups[0]).toContain("nd-CFgMwrVsMDKy68ju");
		expect(sortedGroups[0]).toContain("nd-omdTu2flqJHhMuo8");
		expect(sortedGroups[0]).toContain("nd-GSCigvQfU7lbDsvy");
		expect(sortedGroups[0]).toContain("nd-Y7Uh3GvPRIQwfSGE");
		expect(sortedGroups[0]).toContain("nd-OEac8DMOLd0bwsOe");
		expect(sortedGroups[0]).toContain("nd-7bpl4Q81Z97VgDlt");
		expect(sortedGroups[0]).toContain("nd-k7ii9Cge2s9XF5JF");
		expect(sortedGroups[0]).toContain("nd-w0tHiwkN3n2ZIP2v");

		// Verify the smaller component has 2 nodes
		expect(sortedGroups[1]).toHaveLength(2);
		expect(sortedGroups[1]).toContain("nd-CH7NalFDDDbHQcr7");
		expect(sortedGroups[1]).toContain("nd-YkXO5rkuczwTmnmv");
	});

	it("should handle workspace with no connections", () => {
		const workspace = {
			...workspace1,
			connections: [],
		};

		const groups = groupNodes(workspace);

		// Each node should be in its own group
		expect(groups).toHaveLength(workspace.nodes.length);
		groups.forEach((group) => {
			expect(group).toHaveLength(1);
		});
	});

	it("should handle empty workspace", () => {
		const workspace = {
			...workspace1,
			nodes: [],
			connections: [],
		};

		const groups = groupNodes(workspace);

		expect(groups).toEqual([]);
	});

	it("should handle self-loops correctly", () => {
		const workspace = {
			...workspace1,
			nodes: workspace1.nodes.slice(0, 2),
			connections: [
				{
					id: "cnnc-self" as const,
					outputNode: workspace1.nodes[0],
					outputId: "otp-jzfjEdlrL0Uxtz9G" as const,
					inputNode: workspace1.nodes[0],
					inputId: "inp-self" as const,
				},
			],
		};

		const groups = groupNodes(workspace);

		// Self-loop doesn't create additional groups
		expect(groups).toHaveLength(2);
	});
});
