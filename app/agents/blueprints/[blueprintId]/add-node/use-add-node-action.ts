import {
	type Node,
	useBlueprint,
	useBlueprintId,
} from "@/app/agents/blueprints";
import { findNodeClass, useNodeClasses } from "@/app/node-classes";
import type { InferResponse } from "@/lib/api";
import { useCallback } from "react";
import type { POST, Payload } from "./route";

export const useAddNodeAction = () => {
	const blueprintId = useBlueprintId();
	const { mutateWithCache } = useBlueprint();
	const nodeClasses = useNodeClasses();
	const addNode = useCallback(
		({ node }: Payload) => {
			if (nodeClasses == null) {
				return;
			}
			const nodeClass = findNodeClass(nodeClasses, node.className);
			const draftNode: Node = {
				id: 0,
				position: node.position,
				className: node.className,
				properties: nodeClass.properties ?? [],
				propertyPortMap: nodeClass.propertyPortMap ?? {},
				inputPorts: (nodeClass.inputPorts ?? []).map(
					({ type, label, key }, index) => ({
						id: index,
						nodeId: 0,
						type: type,
						name: label ?? "",
						direction: "input",
						order: index,
						portsBlueprintsId: 0,
						nodeClassKey: key,
					}),
				),
				outputPorts: (nodeClass.outputPorts ?? []).map(
					({ type, label, key }, index) => ({
						id: index,
						nodeId: 0,
						type: type,
						name: label ?? "",
						direction: "output",
						order: index,
						portsBlueprintsId: 0,
						nodeClassKey: key,
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
		[blueprintId, nodeClasses, mutateWithCache],
	);
	return { addNode };
};

type AssertApiResponseJson = (
	json: unknown,
) => asserts json is InferResponse<typeof POST>;
const assertApiResponseJson: AssertApiResponseJson = (json) => {};
const execApi = async (blueprintId: number, payload: Payload) => {
	const json = await fetch(`/agents/blueprints/${blueprintId}/add-node`, {
		method: "POST",
		body: JSON.stringify(payload),
	}).then((res) => res.json());
	assertApiResponseJson(json);
	return json;
};
