import { type Edge, useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { useGraph } from "../graph/context";
import type { Graph } from "../graph/types";
import { type ReactFlowNode, giselleNodeType } from "./giselle-node";

export function graphToReactFlow(grpah: Graph) {
	const nodes: ReactFlowNode[] = grpah.nodes.map((node) => {
		return {
			id: node.id,
			type: giselleNodeType,
			position: node.ui.position,
			data: {
				...node,
			},
		};
	});

	const edges: Edge[] = grpah.connectors.map((connector) => {
		return {
			id: connector.id,
			source: connector.source,
			target: connector.target,
			targetHandle: connector.targetHandle,
		};
	});

	return {
		nodes,
		edges,
	};
}

export const useGraphToReactFlowEffect = () => {
	const { state } = useGraph();
	const reactFlowInstance = useReactFlow();

	useEffect(() => {
		const { nodes, edges } = graphToReactFlow(state.graph);
		reactFlowInstance.setNodes(nodes);
		reactFlowInstance.setEdges(edges);
	}, [reactFlowInstance.setNodes, reactFlowInstance.setEdges, state.graph]);
};
