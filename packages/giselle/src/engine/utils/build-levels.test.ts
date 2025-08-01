import type { Connection, NodeId, NodeLike } from "@giselle-sdk/data-type";
import { describe, expect, it } from "vitest";
import { twoTriggerFixture } from "./__fixtures__/two-trigger";
import { buildLevels } from "./build-levels";

describe("buildLevels", () => {
	describe("parallel execution", () => {
		const nodes: NodeLike[] = [
			{
				id: "nd-triggerNode",
				name: "Trigger",
				type: "operation",
				inputs: [],
				outputs: [
					{ id: "otp-out1Trigger", label: "Output 1", accessor: "output1" },
					{ id: "otp-out2Trigger", label: "Output 2", accessor: "output2" },
				],
				content: { type: "trigger" },
			},
			{
				id: "nd-parallel1Node",
				name: "Parallel 1",
				type: "operation",
				inputs: [{ id: "inp-in1Parallel", label: "Input", accessor: "input" }],
				outputs: [{ id: "otp-outP1", label: "Output", accessor: "output" }],
				content: { type: "textGeneration" },
			},
			{
				id: "nd-parallel2Node",
				name: "Parallel 2",
				type: "operation",
				inputs: [{ id: "inp-in2Parallel", label: "Input", accessor: "input" }],
				outputs: [{ id: "otp-outP2", label: "Output", accessor: "output" }],
				content: { type: "textGeneration" },
			},
			{
				id: "nd-finalNode",
				name: "Final",
				type: "operation",
				inputs: [
					{ id: "inp-inF1", label: "Input 1", accessor: "input1" },
					{ id: "inp-inF2", label: "Input 2", accessor: "input2" },
				],
				outputs: [{ id: "otp-outFinal", label: "Output", accessor: "output" }],
				content: { type: "textGeneration" },
			},
		];

		const connections: Connection[] = [
			{
				id: "cnnc-triggerP1",
				outputNode: {
					id: "nd-triggerNode",
					type: "operation",
					content: { type: "trigger" },
				},
				outputId: "otp-out1Trigger",
				inputNode: {
					id: "nd-parallel1Node",
					type: "operation",
					content: { type: "textGeneration" },
				},
				inputId: "inp-in1Parallel",
			},
			{
				id: "cnnc-triggerP2",
				outputNode: {
					id: "nd-triggerNode",
					type: "operation",
					content: { type: "trigger" },
				},
				outputId: "otp-out2Trigger",
				inputNode: {
					id: "nd-parallel2Node",
					type: "operation",
					content: { type: "textGeneration" },
				},
				inputId: "inp-in2Parallel",
			},
			{
				id: "cnnc-p1Final",
				outputNode: {
					id: "nd-parallel1Node",
					type: "operation",
					content: { type: "textGeneration" },
				},
				outputId: "otp-outP1",
				inputNode: {
					id: "nd-finalNode",
					type: "operation",
					content: { type: "textGeneration" },
				},
				inputId: "inp-inF1",
			},
			{
				id: "cnnc-p2Final",
				outputNode: {
					id: "nd-parallel2Node",
					type: "operation",
					content: { type: "textGeneration" },
				},
				outputId: "otp-outP2",
				inputNode: {
					id: "nd-finalNode",
					type: "operation",
					content: { type: "textGeneration" },
				},
				inputId: "inp-inF2",
			},
		];

		it("should group parallel nodes in the same level", () => {
			const levels = buildLevels(nodes, connections);

			expect(levels).toHaveLength(3);
			expect(levels[0]).toEqual(["nd-triggerNode"]);
			expect(levels[1]).toEqual(
				expect.arrayContaining(["nd-parallel1Node", "nd-parallel2Node"]),
			);
			expect(levels[1]).toHaveLength(2);
			expect(levels[2]).toEqual(["nd-finalNode"]);
		});
	});

	describe("mixed node types", () => {
		const nodes: NodeLike[] = [
			{
				id: "nd-triggerNode",
				name: "Trigger",
				type: "operation",
				inputs: [],
				outputs: [
					{ id: "otp-triggerOut", label: "Output", accessor: "output" },
				],
				content: { type: "trigger" },
			},
			{
				id: "nd-variableNode",
				name: "Variable",
				type: "variable",
				inputs: [],
				outputs: [{ id: "otp-varOut", label: "Text", accessor: "text" }],
				content: { type: "text", text: "Hello World" },
			},
			{
				id: "nd-operationNode",
				name: "Operation",
				type: "operation",
				inputs: [
					{ id: "inp-opIn1", label: "Input 1", accessor: "input1" },
					{ id: "inp-opIn2", label: "Input 2", accessor: "input2" },
				],
				outputs: [{ id: "otp-opOut", label: "Output", accessor: "output" }],
				content: { type: "textGeneration" },
			},
		];

		const connections: Connection[] = [
			{
				id: "cnnc-triggerOp",
				outputNode: {
					id: "nd-triggerNode",
					type: "operation",
					content: { type: "trigger" },
				},
				outputId: "otp-triggerOut",
				inputNode: {
					id: "nd-operationNode",
					type: "operation",
					content: { type: "textGeneration" },
				},
				inputId: "inp-opIn1",
			},
			{
				id: "cnnc-variableOp",
				outputNode: {
					id: "nd-variableNode",
					type: "variable",
					content: { type: "text" },
				},
				outputId: "otp-varOut",
				inputNode: {
					id: "nd-operationNode",
					type: "operation",
					content: { type: "textGeneration" },
				},
				inputId: "inp-opIn2",
			},
		];

		it("should only include operation nodes in levels", () => {
			const levels = buildLevels(nodes, connections);

			expect(levels).toHaveLength(2);
			expect(levels[0]).toEqual(["nd-triggerNode"]);
			expect(levels[1]).toEqual(["nd-operationNode"]);

			// Variable node should not appear in any level
			const allNodeIds = levels.flat();
			expect(allNodeIds).not.toContain("nd-variableNode");
		});
	});

	describe("twoTriggerFixture - complex real-world scenario", () => {
		it("should handle multiple trigger flows with filtered connections", () => {
			// Filter connections to specific connectionIds as used in createAct
			const specificConnectionIds = [
				"cnnc-PoESuO0NCdNDXRLa",
				"cnnc-0I4tbbZ9q1xbHl77",
				"cnnc-xG7dUsEsbSyBcB7J",
				"cnnc-fj7JqjEbDUXReeHH",
				"cnnc-5HwEW7oxzuaE5FIO",
				"cnnc-gdpj7KitsaXvvcPg",
				"cnnc-gH6BCfvsfjiSk4Hz",
				"cnnc-Xh2YmFlB0EzMN7NW",
				"cnnc-SyQDKqDxgRXd5MEC",
			];

			const filteredConnections = twoTriggerFixture.connections.filter(
				(connection) => specificConnectionIds.includes(connection.id),
			);

			const levels = buildLevels(twoTriggerFixture.nodes, filteredConnections);

			// Should have multiple levels due to dependencies
			expect(levels.length).toBeGreaterThan(0);

			// With filtered connections, only connected operation nodes should be included
			const allNodeIds = levels.flat();

			// These are all the operation nodes involved in the filtered connections (Flow 2):
			// - nd-FoP9shtlUFMU5zcI: "On Pull Request Opened" (trigger)
			// - nd-ZEMYDrI7lolEeMEJ: "Manual QA" (receives from trigger and template)
			// - nd-pLEJoQT8VDAJ1Ewx: "Prompt for AI Agents" (receives from trigger and template)
			// - nd-tvQwRmbPhKA69OgT: "Create a Comment for PR" (receives from Manual QA, Prompt AI, and template)
			// - nd-le8wUlKPyfeueTTP: "Create Pull Request Comment" (receives from trigger and Create Comment)
			expect(allNodeIds).toContain("nd-FoP9shtlUFMU5zcI"); // "On Pull Request Opened"
			expect(allNodeIds).toContain("nd-ZEMYDrI7lolEeMEJ"); // "Manual QA" (Flow 2)
			expect(allNodeIds).toContain("nd-pLEJoQT8VDAJ1Ewx"); // "Prompt for AI Agents" (Flow 2)
			expect(allNodeIds).toContain("nd-tvQwRmbPhKA69OgT"); // "Create a Comment for PR" (Flow 2)
			expect(allNodeIds).toContain("nd-le8wUlKPyfeueTTP"); // "Create Pull Request Comment" (Flow 2)

			// buildLevels includes ALL operation nodes, regardless of filtered connections
			// The filtering only affects the dependency relationships, not which nodes are included
			expect(allNodeIds).toHaveLength(10); // All 10 operation nodes should be included

			// All operation nodes should be included (both Flow 1 and Flow 2)
			expect(allNodeIds).toContain("nd-5JoATar9nEGbObfu"); // "On Pull Request Ready for Review" (Flow 1 trigger)
			expect(allNodeIds).toContain("nd-ySQi0YbUMoNsELO3"); // "Manual QA" (Flow 1)
			expect(allNodeIds).toContain("nd-0RVsikMQqKwRMWuZ"); // "Prompt for AI Agents" (Flow 1)
			expect(allNodeIds).toContain("nd-worigWCbqYT9Ofye"); // "Create a Comment for PR" (Flow 1)
			expect(allNodeIds).toContain("nd-Dd7brCDUvMmBK9De"); // "Create Pull Request Comment" (Flow 1)
		});

		it("should not include variable nodes in execution levels with filtered connections", () => {
			// Filter connections to specific connectionIds
			const specificConnectionIds = [
				"cnnc-PoESuO0NCdNDXRLa",
				"cnnc-0I4tbbZ9q1xbHl77",
				"cnnc-xG7dUsEsbSyBcB7J",
				"cnnc-fj7JqjEbDUXReeHH",
				"cnnc-5HwEW7oxzuaE5FIO",
				"cnnc-gdpj7KitsaXvvcPg",
				"cnnc-gH6BCfvsfjiSk4Hz",
				"cnnc-Xh2YmFlB0EzMN7NW",
				"cnnc-SyQDKqDxgRXd5MEC",
			];

			const filteredConnections = twoTriggerFixture.connections.filter(
				(connection) => specificConnectionIds.includes(connection.id),
			);

			const levels = buildLevels(twoTriggerFixture.nodes, filteredConnections);
			const allNodeIds = levels.flat();

			// Template variables should not appear in execution levels
			expect(allNodeIds).not.toContain("nd-xcv9NFBilDvWKyYG"); // "Template for commenting on pull requests"
			expect(allNodeIds).not.toContain("nd-0gHqrsQ63D3oD6H9"); // "Template - Manual QA"
			expect(allNodeIds).not.toContain("nd-SP2PD7natQF8f2yH"); // "Template - Prompt for AI Agents"
		});

		it("should ensure proper dependency order within filtered flow", () => {
			// Filter connections to specific connectionIds
			const specificConnectionIds = [
				"cnnc-PoESuO0NCdNDXRLa",
				"cnnc-0I4tbbZ9q1xbHl77",
				"cnnc-xG7dUsEsbSyBcB7J",
				"cnnc-fj7JqjEbDUXReeHH",
				"cnnc-5HwEW7oxzuaE5FIO",
				"cnnc-gdpj7KitsaXvvcPg",
				"cnnc-gH6BCfvsfjiSk4Hz",
				"cnnc-Xh2YmFlB0EzMN7NW",
				"cnnc-SyQDKqDxgRXd5MEC",
			];

			const filteredConnections = twoTriggerFixture.connections.filter(
				(connection) => specificConnectionIds.includes(connection.id),
			);

			const levels = buildLevels(twoTriggerFixture.nodes, filteredConnections);

			// Find the level of each key node
			const getNodeLevel = (nodeId: NodeId) => {
				for (let i = 0; i < levels.length; i++) {
					if (levels[i].includes(nodeId)) {
						return i;
					}
				}
				return -1;
			};

			// With filtered connections, only Flow 2 should be included
			// nd-FoP9shtlUFMU5zcI (trigger) should be at level 0
			const trigger2Level = getNodeLevel("nd-FoP9shtlUFMU5zcI");
			expect(trigger2Level).toBe(0);

			// Dependent nodes should be in later levels than their dependencies
			const manualQA2Level = getNodeLevel("nd-ZEMYDrI7lolEeMEJ");
			const promptAI2Level = getNodeLevel("nd-pLEJoQT8VDAJ1Ewx");
			const comment2Level = getNodeLevel("nd-tvQwRmbPhKA69OgT");
			const action2Level = getNodeLevel("nd-le8wUlKPyfeueTTP");

			// All should be found and in proper order
			expect(manualQA2Level).toBeGreaterThan(trigger2Level);
			expect(promptAI2Level).toBeGreaterThan(trigger2Level);
			expect(comment2Level).toBeGreaterThan(manualQA2Level);
			expect(comment2Level).toBeGreaterThan(promptAI2Level);
			expect(action2Level).toBeGreaterThan(comment2Level);
		});
	});

	describe("edge cases", () => {
		it("should handle empty inputs", () => {
			const levels = buildLevels([], []);
			expect(levels).toEqual([]);
		});

		it("should handle nodes with no connections", () => {
			const nodes: NodeLike[] = [
				{
					id: "nd-isolatedNode",
					name: "Isolated",
					type: "operation",
					inputs: [],
					outputs: [],
					content: { type: "textGeneration" },
				},
			];

			const levels = buildLevels(nodes, []);
			expect(levels).toEqual([["nd-isolatedNode"]]);
		});

		it("should handle duplicate connections gracefully", () => {
			const nodes: NodeLike[] = [
				{
					id: "nd-node1Dup",
					name: "Node 1",
					type: "operation",
					inputs: [],
					outputs: [{ id: "otp-out1Dup", label: "Output", accessor: "output" }],
					content: { type: "textGeneration" },
				},
				{
					id: "nd-node2Dup",
					name: "Node 2",
					type: "operation",
					inputs: [{ id: "inp-in2Dup", label: "Input", accessor: "input" }],
					outputs: [],
					content: { type: "textGeneration" },
				},
			];

			const connections: Connection[] = [
				{
					id: "cnnc-conn1Dup",
					outputNode: {
						id: "nd-node1Dup",
						type: "operation",
						content: { type: "textGeneration" },
					},
					outputId: "otp-out1Dup",
					inputNode: {
						id: "nd-node2Dup",
						type: "operation",
						content: { type: "textGeneration" },
					},
					inputId: "inp-in2Dup",
				},
				{
					id: "cnnc-conn2Dup", // Duplicate connection
					outputNode: {
						id: "nd-node1Dup",
						type: "operation",
						content: { type: "textGeneration" },
					},
					outputId: "otp-out1Dup",
					inputNode: {
						id: "nd-node2Dup",
						type: "operation",
						content: { type: "textGeneration" },
					},
					inputId: "inp-in2Dup",
				},
			];

			const levels = buildLevels(nodes, connections);
			expect(levels).toEqual([["nd-node1Dup"], ["nd-node2Dup"]]);
		});

		it("should break cycles gracefully", () => {
			const nodes: NodeLike[] = [
				{
					id: "nd-node1Cycle",
					name: "Node 1",
					type: "operation",
					inputs: [{ id: "inp-in1Cycle", label: "Input", accessor: "input" }],
					outputs: [
						{ id: "otp-out1Cycle", label: "Output", accessor: "output" },
					],
					content: { type: "textGeneration" },
				},
				{
					id: "nd-node2Cycle",
					name: "Node 2",
					type: "operation",
					inputs: [{ id: "inp-in2Cycle", label: "Input", accessor: "input" }],
					outputs: [
						{ id: "otp-out2Cycle", label: "Output", accessor: "output" },
					],
					content: { type: "textGeneration" },
				},
			];

			const connections: Connection[] = [
				{
					id: "cnnc-conn1to2Cycle",
					outputNode: {
						id: "nd-node1Cycle",
						type: "operation",
						content: { type: "textGeneration" },
					},
					outputId: "otp-out1Cycle",
					inputNode: {
						id: "nd-node2Cycle",
						type: "operation",
						content: { type: "textGeneration" },
					},
					inputId: "inp-in2Cycle",
				},
				{
					id: "cnnc-conn2to1Cycle", // Creates a cycle
					outputNode: {
						id: "nd-node2Cycle",
						type: "operation",
						content: { type: "textGeneration" },
					},
					outputId: "otp-out2Cycle",
					inputNode: {
						id: "nd-node1Cycle",
						type: "operation",
						content: { type: "textGeneration" },
					},
					inputId: "inp-in1Cycle",
				},
			];

			const levels = buildLevels(nodes, connections);
			// Should terminate gracefully without infinite loop
			expect(levels).toBeDefined();
			expect(Array.isArray(levels)).toBe(true);
		});
	});
});
