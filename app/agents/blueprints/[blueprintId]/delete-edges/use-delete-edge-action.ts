import { useBlueprint } from "@/app/agents/blueprints";
import { useCallback } from "react";
import type { Payload } from "./route";

export const useDeleteEdgesAction = (blueprintId: number | undefined) => {
	const { mutateWithCache } = useBlueprint(blueprintId);
	const deleteEdges = useCallback(
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
							(node) => !payload.deleteEdgeIds.includes(node.id),
						),
					},
				}),
				optimisticDataWithCache: (prev) => ({
					blueprint: {
						...prev.blueprint,
						nodes: prev.blueprint.nodes.filter(
							(node) => !payload.deleteEdgeIds.includes(node.id),
						),
					},
				}),
			});
		},
		[blueprintId, mutateWithCache],
	);
	return { deleteEdges };
};

const execApi = (blueprintId: number, payload: Payload) =>
	fetch(`/agents/blueprints/${blueprintId}/delete-edges`, {
		method: "DELETE",
		body: JSON.stringify(payload),
	});
