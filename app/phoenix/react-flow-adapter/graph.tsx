import {
	type Edge,
	type OnSelectionChangeFunc,
	useOnSelectionChange,
	useReactFlow,
} from "@xyflow/react";
import { useCallback, useEffect } from "react";
import type { GiselleNodeId } from "../giselle-node/types";
import { selectNode } from "../graph/actions";
import { useGraph } from "../graph/context";
import type { Graph } from "../graph/types";
import { type ReactFlowNode, giselleNodeType } from "./giselle-node";

export function graphToReactFlow(grpah: Graph) {
	const nodes: ReactFlowNode[] = grpah.nodes.map((node) => {
		return {
			id: node.id,
			type: giselleNodeType,
			position: node.ui.position,
			selected: node.ui.selected,
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
	const { state, dispatch } = useGraph();
	const reactFlowInstance = useReactFlow();

	useEffect(() => {
		const { nodes, edges } = graphToReactFlow(state.graph);
		reactFlowInstance.setNodes(nodes);
		reactFlowInstance.setEdges(edges);
	}, [reactFlowInstance.setNodes, reactFlowInstance.setEdges, state.graph]);

	const onChange = useCallback<OnSelectionChangeFunc>(
		({ nodes }) => {
			dispatch(
				selectNode({
					selectedNodeIds: nodes.map((node) => node.id as GiselleNodeId),
				}),
			);
		},
		[dispatch],
	);

	useOnSelectionChange({
		onChange,
	});
};
