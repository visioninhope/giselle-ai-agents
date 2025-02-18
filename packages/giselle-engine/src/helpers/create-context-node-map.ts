import type { Node, NodeId, TextGenerationNode } from "@giselle-sdk/data-type";

export function createContextNodeMap(
	node: TextGenerationNode,
	nodeMap: Map<NodeId, Node>,
) {
	const contextMap = new Map<NodeId, Node>();
	for (const sourceConnectionHandle of node.content.sources) {
		const sourceNode = nodeMap.get(sourceConnectionHandle.connectedNodeId);
		if (sourceNode !== undefined) {
			contextMap.set(sourceNode.id, sourceNode);
		}
	}
	return contextMap;
}
