import {
	type BlueprintPort,
	type Node,
	useBlueprint,
	useBlueprintId,
} from "@/app/agents/blueprints";
import { findNodeClass, useNodeClasses } from "@/app/node-classes";
import type { InferResponse } from "@/lib/api";
import { useCallback } from "react";
import type { POST, Payload } from "./route";

export const useAddNodePortAction = () => {
	const blueprintId = useBlueprintId();
	const { mutateWithCache } = useBlueprint();
	const nodeClasses = useNodeClasses();
	const addNodePort = useCallback(
		({ port }: Payload) => {
			if (nodeClasses == null) {
				return;
			}
			const draftPort: BlueprintPort = {
				id: 0,
				nodeId: port.nodeId,
				type: "data",
				name: port.name,
				direction: port.direction,
				order: 1000,
			};
			mutateWithCache({
				sendRequest: execApi(blueprintId, { port }),
				mutateWithCache: (prev, json) => ({
					blueprint: {
						...prev.blueprint,
						nodes: prev.blueprint.nodes.map((node) => {
							if (node.id !== json.port.nodeId) {
								return node;
							}
							if (json.port.direction === "input") {
								return {
									...node,
									inputPorts: [...node.inputPorts, json.port],
								};
							}
							return {
								...node,
								outputPorts: [...node.outputPorts, json.port],
							};
						}),
					},
				}),
				optimisticDataWithCache: (prev) => ({
					blueprint: {
						...prev.blueprint,
						nodes: prev.blueprint.nodes.map((node) => {
							if (node.id !== draftPort.nodeId) {
								return node;
							}
							if (draftPort.direction === "input") {
								return {
									...node,
									inputPorts: [...node.inputPorts, draftPort],
								};
							}
							return {
								...node,
								outputPorts: [...node.outputPorts, draftPort],
							};
						}),
					},
				}),
			});
		},
		[blueprintId, nodeClasses, mutateWithCache],
	);
	return { addNodePort };
};

type AssertApiResponseJson = (
	json: unknown,
) => asserts json is InferResponse<typeof POST>;
const assertApiResponseJson: AssertApiResponseJson = (json) => {};
const execApi = async (blueprintId: number, payload: Payload) => {
	const json = await fetch(`/agents/blueprints/${blueprintId}/add-node-port`, {
		method: "POST",
		body: JSON.stringify(payload),
	}).then((res) => res.json());
	assertApiResponseJson(json);
	return json;
};
