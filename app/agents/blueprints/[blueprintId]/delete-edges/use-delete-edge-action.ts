import { useBlueprint, useBlueprintId } from "@/app/agents/blueprints";
import { useCallback } from "react";
import type { Payload } from "./route";

export const useDeleteEdgesAction = () => {
	const blueprintId = useBlueprintId();
	const { mutateWithCache } = useBlueprint();
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
						edges: prev.blueprint.edges.filter(
							(edge) => !payload.deleteEdgeIds.includes(edge.id),
						),
					},
				}),
				optimisticDataWithCache: (prev) => ({
					blueprint: {
						...prev.blueprint,
						edges: prev.blueprint.edges.filter(
							(edge) => !payload.deleteEdgeIds.includes(edge.id),
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
