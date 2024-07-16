import { findNodeDef, useNodeDefs } from "@/app/node-defs";
import type { InferResponse } from "@/lib/api";
import { useCallback } from "react";
import type { Node } from "../../../";
import { useBlueprint } from "../../use-blueprint";
import type { POST, Payload } from "./route";

export const useAddNodeAction = (blueprintId: number | undefined) => {
	const { mutateWithCache } = useBlueprint(blueprintId);
	const { nodeDefs } = useNodeDefs();
	const addNode = useCallback(
		({ node }: Payload) => {
			if (blueprintId == null || nodeDefs == null) {
				return;
			}
			const nodeDef = findNodeDef(nodeDefs, node.class);
			const draftNode: Node = {
				id: 0,
				position: node.position,
				class: node.class,
				inputPorts: (nodeDef.inputPorts ?? []).map(
					({ type, label }, index) => ({
						id: index,
						nodeId: 0,
						type: type,
						name: label ?? "",
						direction: "input",
						order: index,
					}),
				),
				outputPorts: (nodeDef.outputPorts ?? []).map(
					({ type, label }, index) => ({
						id: index,
						nodeId: 0,
						type: type,
						name: label ?? "",
						direction: "output",
						order: index,
					}),
				),
			};
			mutateWithCache({
				sendRequest: execApi(blueprintId, { node }),
				mutateWithCache: (prev, json) => ({
					blueprint: {
						...prev.blueprint,
						nodes: [...prev.blueprint.nodes, json.node],
					},
				}),
				optimisticDataWithCache: (prev) => ({
					blueprint: {
						...prev.blueprint,
						nodes: [...prev.blueprint.nodes, draftNode],
					},
				}),
			});
		},
		[blueprintId, nodeDefs, mutateWithCache],
	);
	return { addNode };
};

type AssertApiResponseJson = (
	json: unknown,
) => asserts json is InferResponse<typeof POST>;
const assertApiResponseJson: AssertApiResponseJson = (json) => {};
const execApi = async (blueprintId: number, payload: Payload) => {
	const json = await fetch(`/agents/blueprints/${blueprintId}/nodes/add-node`, {
		method: "POST",
		body: JSON.stringify(payload),
	}).then((res) => res.json());
	assertApiResponseJson(json);
	return json;
};
