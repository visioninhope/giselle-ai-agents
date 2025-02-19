// import {
// 	type Node,
// 	type NodeId,
// 	Workspace,
// 	createConnection,
// 	createConnectionHandle,
// 	createTextGenerationNode,
// 	createTextNode,
// 	generateInitialWorkspace,
// } from "@giselle-sdk/data-type";

// export const textGenerationNode1 = createTextGenerationNode({
// 	name: "Text Generation Node 1",
// });
// export const textGenerationNode2 = createTextGenerationNode({
// 	name: "Text Generation Node 2",
// });
// export const textGenerationNode3 = createTextGenerationNode({
// 	name: "Text Generation Node 3",
// });
// export const textGenerationNode4 = createTextGenerationNode({
// 	name: "Text Generation Node 4",
// });
// export const textNode1 = createTextNode({
// 	name: "Text Node 1",
// });
// export const connectionHandle1 = createConnectionHandle({
// 	label: "source",
// 	nodeType: textGenerationNode1.type,
// 	connectedNodeId: textNode1.id,
// });
// export const connection1 = createConnection({
// 	sourceNode: textNode1,
// 	targetNodeHandle: connectionHandle1,
// });
// export const connectionHandle2 = createConnectionHandle({
// 	label: "source",
// 	nodeId: textGenerationNode2.id,
// 	nodeType: textGenerationNode2.type,
// 	connectedNodeId: textGenerationNode1.id,
// });
// export const connection2 = createConnection({
// 	sourceNode: textGenerationNode1,
// 	targetNodeHandle: connectionHandle2,
// });
// export const connectionHandle3 = createConnectionHandle({
// 	label: "source",
// 	nodeId: textGenerationNode2.id,
// 	nodeType: textGenerationNode2.type,
// 	connectedNodeId: textGenerationNode4.id,
// });
// export const connection3 = createConnection({
// 	sourceNode: textGenerationNode4,
// 	targetNodeHandle: connectionHandle3,
// });
// export const connectionHandle4 = createConnectionHandle({
// 	label: "source",
// 	nodeId: textGenerationNode3.id,
// 	nodeType: textGenerationNode3.type,
// 	connectedNodeId: textGenerationNode2.id,
// });
// export const connection4 = createConnection({
// 	sourceNode: textGenerationNode2,
// 	targetNodeHandle: connectionHandle4,
// });
// export const textGenerationNode5 = createTextGenerationNode({
// 	name: "Text Generation Node 5",
// });
// export const textGenerationNode6 = createTextGenerationNode({
// 	name: "Text Generation Node 6",
// });
// export const connectionHandle5 = createConnectionHandle({
// 	label: "source",
// 	nodeId: textGenerationNode6.id,
// 	nodeType: textGenerationNode6.type,
// 	connectedNodeId: textGenerationNode5.id,
// });
// export const connection5 = createConnection({
// 	sourceNode: textGenerationNode5,
// 	targetNodeHandle: connectionHandle5,
// });
// export const textGenerationNode7 = createTextGenerationNode({
// 	name: "Text Generation Node 7",
// });
// export const testWorkspace = Workspace.parse({
// 	...generateInitialWorkspace(),
// 	nodeMap: new Map<NodeId, Node>([
// 		[textGenerationNode1.id, textGenerationNode1],
// 		[textNode1.id, textNode1],
// 		[textGenerationNode2.id, textGenerationNode2],
// 		[textGenerationNode3.id, textGenerationNode3],
// 		[textGenerationNode4.id, textGenerationNode4],
// 		[textGenerationNode5.id, textGenerationNode5],
// 		[textGenerationNode6.id, textGenerationNode6],
// 		[textGenerationNode7.id, textGenerationNode7],
// 	]),
// 	connectionMap: new Map([
// 		[connection1.id, connection1],
// 		[connection2.id, connection2],
// 		[connection3.id, connection3],
// 		[connection4.id, connection4],
// 		[connection5.id, connection5],
// 	]),
// });
