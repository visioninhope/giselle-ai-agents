import {
	type Blueprint,
	useBlueprint,
	useBlueprintId,
} from "@/app/agents/blueprints";
import { useCallback } from "react";
import type { Payload } from "./route";

type UpdateNodePropertiesArgs = Omit<Payload, "blueprintId">;
export const useUpdateNodeProperties = () => {
	const blueprintId = useBlueprintId();
	const { mutateWithCache } = useBlueprint();
	const updateNodeProperties = useCallback(
		(args: UpdateNodePropertiesArgs) => {
			mutateWithCache({
				sendRequest: execApi(blueprintId, { ...args, blueprintId }),
				mutateWithCache: (prev) => synthesize(prev, { ...args, blueprintId }),
				optimisticDataWithCache: (prev) =>
					synthesize(prev, { ...args, blueprintId }),
			});
		},
		[blueprintId, mutateWithCache],
	);
};

const execApi = (blueprintId: number, payload: Payload) =>
	fetch(`/agents/blueprints/${blueprintId}/update-node-properties`, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

const synthesize = (
	prev: { blueprint: Blueprint },
	payload: Payload,
): { blueprint: Blueprint } => {
	const nodes = prev.blueprint.nodes.map((node) => {
		if (node.id !== payload.nodeId) {
			return node;
		}
		return {
			...node,
			properties: payload.properties,
		};
	});
	return {
		blueprint: {
			...prev.blueprint,
			nodes,
		},
	};
};
