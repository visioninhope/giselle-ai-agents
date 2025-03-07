// import { type NodeData, type NodeId, WorkflowId } from "@giselle-sdk/data-type";
// import {
// 	connection1,
// 	connection2,
// 	connection3,
// 	connection4,
// 	connection5,
// 	testWorkspace,
// 	textGenerationNode1,
// 	textGenerationNode2,
// 	textGenerationNode3,
// 	textGenerationNode4,
// 	textGenerationNode5,
// 	textGenerationNode6,
// 	textGenerationNode7,
// 	textNode1,
// } from "@giselle-sdk/test-utils";
// import { describe, expect, test } from "vitest";
// import {
// 	createConnectedNodeIdMap,
// 	createJobMap,
// 	findConnectedConnectionMap,
// 	findConnectedNodeMap,
// } from "./helper";

// test("createConnectionMap", () => {
// 	expect(
// 		createConnectedNodeIdMap(
// 			new Set(testWorkspace.connectionMap.values()),
// 			new Set(testWorkspace.nodeMap.keys()),
// 		),
// 	).toStrictEqual(
// 		new Map([
// 			[textNode1.id, new Set([textGenerationNode1.id])],
// 			[textGenerationNode1.id, new Set([textNode1.id, textGenerationNode2.id])],
// 			[
// 				textGenerationNode2.id,
// 				new Set([
// 					textGenerationNode1.id,
// 					textGenerationNode3.id,
// 					textGenerationNode4.id,
// 				]),
// 			],
// 			[textGenerationNode3.id, new Set([textGenerationNode2.id])],
// 			[textGenerationNode4.id, new Set([textGenerationNode2.id])],
// 			[textGenerationNode5.id, new Set([textGenerationNode6.id])],
// 			[textGenerationNode6.id, new Set([textGenerationNode5.id])],
// 		]),
// 	);
// });

// describe("findConnectedNodeMap", () => {
// 	const connectionMap = createConnectedNodeIdMap(
// 		new Set(testWorkspace.connectionMap.values()),
// 		new Set(testWorkspace.nodeMap.keys()),
// 	);
// 	test("start by textGenerationNode1", () => {
// 		expect(
// 			findConnectedNodeMap(
// 				textGenerationNode1.id,
// 				testWorkspace.nodeMap,
// 				connectionMap,
// 			),
// 		).toStrictEqual(
// 			new Map<NodeId, NodeData>([
// 				[textGenerationNode1.id, textGenerationNode1],
// 				[textNode1.id, textNode1],
// 				[textGenerationNode2.id, textGenerationNode2],
// 				[textGenerationNode3.id, textGenerationNode3],
// 				[textGenerationNode4.id, textGenerationNode4],
// 			]),
// 		);
// 	});
// 	test("start by textGenerationNode2", () => {
// 		expect(
// 			findConnectedNodeMap(
// 				textGenerationNode2.id,
// 				testWorkspace.nodeMap,
// 				connectionMap,
// 			),
// 		).toStrictEqual(
// 			new Map<NodeId, NodeData>([
// 				[textGenerationNode1.id, textGenerationNode1],
// 				[textNode1.id, textNode1],
// 				[textGenerationNode2.id, textGenerationNode2],
// 				[textGenerationNode3.id, textGenerationNode3],
// 				[textGenerationNode4.id, textGenerationNode4],
// 			]),
// 		);
// 	});
// 	test("start by textGenerationNode4", () => {
// 		expect(
// 			findConnectedNodeMap(
// 				textGenerationNode5.id,
// 				testWorkspace.nodeMap,
// 				connectionMap,
// 			),
// 		).toStrictEqual(
// 			new Map<NodeId, NodeData>([
// 				[textGenerationNode5.id, textGenerationNode5],
// 				[textGenerationNode6.id, textGenerationNode6],
// 			]),
// 		);
// 	});
// 	test("start by textGenerationNode6", () => {
// 		expect(
// 			findConnectedNodeMap(
// 				textGenerationNode7.id,
// 				testWorkspace.nodeMap,
// 				connectionMap,
// 			),
// 		).toStrictEqual(
// 			new Map<NodeId, NodeData>([
// 				[textGenerationNode7.id, textGenerationNode7],
// 			]),
// 		);
// 	});
// });

// describe("findConnectedConnections", () => {
// 	const connectionMap = createConnectedNodeIdMap(
// 		new Set(testWorkspace.connectionMap.values()),
// 		new Set(testWorkspace.nodeMap.keys()),
// 	);
// 	test("start by textGenerationNode1", () => {
// 		const connectedNodeMap = findConnectedNodeMap(
// 			textGenerationNode1.id,
// 			testWorkspace.nodeMap,
// 			connectionMap,
// 		);
// 		expect(
// 			findConnectedConnectionMap(
// 				new Set(connectedNodeMap.keys()),
// 				new Set(testWorkspace.connectionMap.values()),
// 			),
// 		).toStrictEqual(
// 			new Map([
// 				[connection1.id, connection1],
// 				[connection2.id, connection2],
// 				[connection3.id, connection3],
// 				[connection4.id, connection4],
// 			]),
// 		);
// 	});
// 	test("start by textGenerationNode4", () => {
// 		const connectedNodeMap = findConnectedNodeMap(
// 			textGenerationNode5.id,
// 			testWorkspace.nodeMap,
// 			connectionMap,
// 		);
// 		expect(
// 			findConnectedConnectionMap(
// 				new Set(connectedNodeMap.keys()),
// 				new Set(testWorkspace.connectionMap.values()),
// 			),
// 		).toStrictEqual(new Map([[connection5.id, connection5]]));
// 	});
// });
// describe("createJobsFromGraph", () => {
// 	const connectionMap = createConnectedNodeIdMap(
// 		new Set(testWorkspace.connectionMap.values()),
// 		new Set(testWorkspace.nodeMap.keys()),
// 	);
// 	test("start by textGenerationNode1", () => {
// 		const connectedNodeMap = findConnectedNodeMap(
// 			textGenerationNode1.id,
// 			testWorkspace.nodeMap,
// 			connectionMap,
// 		);
// 		const connectedConnectionMap = findConnectedConnectionMap(
// 			new Set(connectedNodeMap.keys()),
// 			new Set(testWorkspace.connectionMap.values()),
// 		);
// 		const workflowId = WorkflowId.generate();
// 		const jobSet = createJobMap(
// 			new Set(connectedNodeMap.values()),
// 			new Set(connectedConnectionMap.values()),
// 			workflowId,
// 		);
// 		expect(jobSet.size).toBe(3);
// 		const jobSetIterator = jobSet.values();
// 		const firstJob = jobSetIterator.next().value;
// 		expect(firstJob?.stepMap.size).toBe(2);
// 		const firstJobFirstStep = firstJob?.stepMap.values().next().value;
// 		expect(firstJobFirstStep?.nodeId).toBe(textGenerationNode1.id);
// 		expect(firstJobFirstStep?.variableNodeIds).toStrictEqual(
// 			new Set([textNode1.id]),
// 		);
// 		const secondJob = jobSetIterator.next().value;
// 		expect(secondJob?.stepMap.size).toBe(1);
// 		const secondJobFirstStep = secondJob?.stepMap.values().next().value;
// 		expect(secondJobFirstStep?.nodeId).toBe(textGenerationNode2.id);
// 		expect(secondJobFirstStep?.variableNodeIds).toStrictEqual(new Set());
// 		const thirdJob = jobSetIterator.next().value;
// 		expect(thirdJob?.stepMap.size).toBe(1);
// 		const thirdJobFirstStep = thirdJob?.stepMap.values().next().value;
// 		expect(thirdJobFirstStep?.nodeId).toBe(textGenerationNode3.id);
// 		expect(thirdJobFirstStep?.variableNodeIds).toStrictEqual(new Set());
// 	});
// 	test("start by textGenerationNode4", () => {
// 		const connectedNodeMap = findConnectedNodeMap(
// 			textGenerationNode5.id,
// 			testWorkspace.nodeMap,
// 			connectionMap,
// 		);
// 		const connectedConnectionMap = findConnectedConnectionMap(
// 			new Set(connectedNodeMap.keys()),
// 			new Set(testWorkspace.connectionMap.values()),
// 		);
// 		const workflowId = WorkflowId.generate();
// 		const jobSet = createJobMap(
// 			new Set(connectedNodeMap.values()),
// 			new Set(connectedConnectionMap.values()),
// 			workflowId,
// 		);
// 		expect(jobSet.size).toBe(2);
// 		const firstJob = jobSet.values().next().value;
// 		expect(firstJob?.stepMap.size).toBe(1);
// 		const firstJobFirstStep = firstJob?.stepMap.values().next().value;
// 		expect(firstJobFirstStep?.nodeId).toBe(textGenerationNode5.id);
// 	});
// });
