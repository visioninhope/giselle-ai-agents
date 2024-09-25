import { useReactFlow } from "@xyflow/react";
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

	return {
		nodes,
	};
}

export const useGraphToReactFlowEffect = () => {
	const { state } = useGraph();
	const reactFlowInstance = useReactFlow();

	useEffect(() => {
		const { nodes } = graphToReactFlow(state.graph);
		reactFlowInstance.setNodes(nodes);
	}, [reactFlowInstance.setNodes, state.graph]);
};
