import {
	type BlueprintPort,
	useBlueprint,
	useBlueprintId,
} from "@/app/agents/blueprints";
import { useNodeClasses } from "@/app/node-classes";
import type { ports as portsSchema } from "@/drizzle";
import { useCallback } from "react";
import type { Payload } from "./route";

type UpdatePortNameArgs = {
	port: Pick<
		typeof portsSchema.$inferSelect,
		"id" | "nodeId" | "name" | "direction" | "order"
	>;
};
export const useUpdatePortnameAction = () => {
	const blueprintId = useBlueprintId();
	const { mutateWithCache } = useBlueprint();
	const nodeClasses = useNodeClasses();
	const updatePortName = useCallback(
		({ port }: UpdatePortNameArgs) => {
			if (nodeClasses == null) {
				return;
			}
			const optimisticPort: BlueprintPort = {
				...port,
				type: "data",
			};
			mutateWithCache({
				sendRequest: execApi(blueprintId, { port }),
				mutateWithCache: (prev) => ({
					blueprint: {
						...prev.blueprint,
						nodes: prev.blueprint.nodes.map((node) => {
							if (node.id !== optimisticPort.nodeId) {
								return node;
							}
							if (optimisticPort.direction === "input") {
								return {
									...node,
									inputPorts: node.inputPorts.map((port) =>
										port.id !== optimisticPort.id ? port : optimisticPort,
									),
								};
							}
							return {
								...node,
								outputPorts: node.outputPorts.map((port) =>
									port.id !== optimisticPort.id ? port : optimisticPort,
								),
							};
						}),
					},
				}),
				optimisticDataWithCache: (prev) => ({
					blueprint: {
						...prev.blueprint,
						nodes: prev.blueprint.nodes.map((node) => {
							if (node.id !== optimisticPort.nodeId) {
								return node;
							}
							if (optimisticPort.direction === "input") {
								return {
									...node,
									inputPorts: node.inputPorts.map((port) =>
										port.id !== optimisticPort.id ? port : optimisticPort,
									),
								};
							}
							return {
								...node,
								outputPorts: node.outputPorts.map((port) =>
									port.id !== optimisticPort.id ? port : optimisticPort,
								),
							};
						}),
					},
				}),
			});
		},
		[blueprintId, nodeClasses, mutateWithCache],
	);
	return { updatePortName };
};

const execApi = (blueprintId: number, payload: Payload) =>
	fetch(`/agents/blueprints/${blueprintId}/update-port-name`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
