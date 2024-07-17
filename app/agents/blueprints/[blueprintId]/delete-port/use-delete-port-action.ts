import {
	type BlueprintPort,
	useBlueprint,
	useBlueprintId,
} from "@/app/agents/blueprints";
import { useNodeClasses } from "@/app/node-classes";
import type { ports as portsSchema } from "@/drizzle";
import { useCallback } from "react";
import type { Payload } from "./route";

export const useDeletePortAction = () => {
	const blueprintId = useBlueprintId();
	const { mutateWithCache } = useBlueprint();
	const deletePort = useCallback(
		({ port }: Payload) => {
			mutateWithCache({
				sendRequest: execApi(blueprintId, { port }),
				mutateWithCache: (prev) => ({
					blueprint: {
						...prev.blueprint,
						nodes: prev.blueprint.nodes.map((node) => ({
							...node,
							inputPorts: node.inputPorts.filter(({ id }) => id !== port.id),
							outputPorts: node.outputPorts.filter(({ id }) => id !== port.id),
						})),
					},
				}),
				optimisticDataWithCache: (prev) => ({
					blueprint: {
						...prev.blueprint,
						nodes: prev.blueprint.nodes.map((node) => ({
							...node,
							inputPorts: node.inputPorts.filter(({ id }) => id !== port.id),
							outputPorts: node.outputPorts.filter(({ id }) => id !== port.id),
						})),
					},
				}),
			});
		},
		[blueprintId, mutateWithCache],
	);
	return { deletePort };
};

const execApi = (blueprintId: number, payload: Payload) =>
	fetch(`/agents/blueprints/${blueprintId}/delete-port`, {
		method: "DELETE",
		body: JSON.stringify(payload),
	});
