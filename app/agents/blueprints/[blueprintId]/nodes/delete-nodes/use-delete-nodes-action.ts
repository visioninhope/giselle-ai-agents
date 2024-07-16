import { useBlueprint } from "@/app/agents/blueprints";
import { useCallback } from "react";
import type { Payload } from "./route";

export const useDeleteNodesAction = (blueprintId: number | undefined) => {
	const { mutateWithCache } = useBlueprint(blueprintId);
	const deleteNodes = useCallback(
		(payload: Payload) => {
			if (blueprintId == null) {
				return;
			}
			mutateWithCache({
				sendRequest: execApi(blueprintId, payload),
				mutateWithCache: (prev) => ({
					blueprint: {
						...prev.blueprint,
						nodes: prev.blueprint.nodes.filter(
							(node) => !payload.deleteNodeIds.includes(node.id),
						),
					},
				}),
				optimisticDataWithCache: (prev) => ({
					blueprint: {
						...prev.blueprint,
						nodes: prev.blueprint.nodes.filter(
							(node) => !payload.deleteNodeIds.includes(node.id),
						),
					},
				}),
			});
		},
		[blueprintId, mutateWithCache],
	);
	return { deleteNodes };
};

const execApi = (blueprintId: number, payload: Payload) =>
	fetch(`/agents/blueprints/${blueprintId}/nodes/delete-nodes`, {
		method: "DELETE",
		body: JSON.stringify(payload),
	});
