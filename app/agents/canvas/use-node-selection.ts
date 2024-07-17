import type { Node } from "@/app/agents/blueprints";
import { useCallback, useState } from "react";
import invariant from "tiny-invariant";
import { useBlueprint } from "../blueprints";

export const useNodeSelection = () => {
	const { blueprint } = useBlueprint();
	const [selectedNodes, setSelectedNodes] = useState<Node[]>([]);
	const addSelectedNodes = useCallback(
		(addNodeIds: number[]) => {
			if (blueprint == null) {
				return;
			}
			console.log(addNodeIds);
			console.log("start");
			setSelectedNodes((prev) => {
				console.log({ prev });
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
			console.log("end");
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
