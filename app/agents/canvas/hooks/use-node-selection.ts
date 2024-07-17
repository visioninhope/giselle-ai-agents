import { type Node, useBlueprint } from "@/app/agents/blueprints";
import type { OnNodesChange } from "@xyflow/react";
import { useCallback, useState } from "react";
import invariant from "tiny-invariant";

export const useNodeSelection = () => {
	const { blueprint } = useBlueprint();
	const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);

	const addSelectedNodes = useCallback(
		(addNodeIds: number[]) => {
			if (blueprint == null) {
				return;
			}
			setSelectedNodes((prev) => {
				return [
					...prev,
					...addNodeIds.map((addNodeId) => {
						const addNode = blueprint.nodes.find(
							(node) => node.id === addNodeId,
						);
						invariant(
							addNode != null,
							`Node ${addNodeId} not found in blueprint`,
						);
						return addNode;
					}),
				];
			});
		},
		[blueprint],
	);
	const removeSelectedNodes = useCallback((removeNodeIds: number[]) => {
		setSelectedNodes((selectedNodes) =>
			selectedNodes.filter((node) => !removeNodeIds.includes(node.id)),
		);
	}, []);

	const handleNodesChange = useCallback<OnNodesChange>(
		(nodesChange) => {
			const changeSelectNodes = nodesChange
				.map((nodeChange) => {
					if (nodeChange.type === "select") {
						return nodeChange;
					}
					return null;
				})
				.filter((changeNode) => changeNode != null);

			const selectedNodes = changeSelectNodes
				.filter((changeSelectNode) => changeSelectNode.selected)
				.map((selectedNode) => Number.parseInt(selectedNode.id, 10));
			addSelectedNodes(selectedNodes);
			const deselectedNodes = changeSelectNodes
				.filter((changeSelectNode) => !changeSelectNode.selected)
				.map((deselectedNode) => Number.parseInt(deselectedNode.id, 10));
			removeSelectedNodes(deselectedNodes);
		},
		[addSelectedNodes, removeSelectedNodes],
	);
	return {
		selectedNodes,
		addSelectedNodes,
		removeSelectedNodes,
		handleNodesChange,
	};
};
