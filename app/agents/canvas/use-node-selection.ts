import type { Node } from "@/app/agents/blueprints";
import { useCallback, useState } from "react";
import invariant from "tiny-invariant";
import { useBlueprint } from "../blueprints";

export const useNodeSelection = (blueprintId: number | undefined) => {
	const { blueprint } = useBlueprint(blueprintId);
	const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
	const addSelectedNodes = useCallback(
		(addNodeIds: number[]) => {
			if (blueprint == null) {
				return;
			}
			setSelectedNodes(
				addNodeIds.map((addNodeId) => {
					const addNode = blueprint.nodes.find((node) => node.id === addNodeId);
					invariant(
						addNode != null,
						`Node ${addNodeId} not found in blueprint`,
					);
					return addNode;
				}),
			);
		},
		[blueprint],
	);
	const removeSelectedNodes = useCallback((removeNodeIds: number[]) => {
		setSelectedNodes((selectedNodes) =>
			selectedNodes.filter((node) => !removeNodeIds.includes(node.id)),
		);
	}, []);
	return { selectedNodes, addSelectedNodes, removeSelectedNodes };
};
