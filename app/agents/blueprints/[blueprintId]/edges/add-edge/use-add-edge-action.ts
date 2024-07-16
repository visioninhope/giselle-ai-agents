import type { InferResponse } from "@/lib/api";
import { useCallback } from "react";
import { useBlueprint } from "../../use-blueprint";
import type { POST, Payload } from "./route";

type AddEdgeArgs = {
	originPort: {
		id: number;
		nodeId: number;
	};
	destinationPort: {
		id: number;
		nodeId: number;
	};
};
export const useAddEdgeAction = (blueprintId: number | undefined) => {
	const { mutateWithCache } = useBlueprint(blueprintId);
	const addEdge = useCallback(
		async (args: AddEdgeArgs) => {
			if (blueprintId == null) {
				return;
			}
			mutateWithCache({
				sendRequest: execApi(blueprintId, {
					edge: {
						originPortId: args.originPort.id,
						destinationPortId: args.destinationPort.id,
					},
				}),
				mutateWithCache: (prev, response) => ({
					blueprint: {
						...prev.blueprint,
						edges: [...prev.blueprint.edges, response.edge],
					},
				}),
				optimisticDataWithCache: (prev) => ({
					blueprint: {
						...prev.blueprint,
						edges: [
							...prev.blueprint.edges,
							{
								id: 0,
								edgeType: "data",
								inputPort: {
									id: args.destinationPort.id,
									nodeId: args.destinationPort.nodeId,
								},
								outputPort: {
									id: args.originPort.id,
									nodeId: args.originPort.nodeId,
								},
							},
						],
					},
				}),
			});
		},
		[blueprintId, mutateWithCache],
	);
	return { addEdge };
};

type AssertResponse = (
	json: unknown,
) => asserts json is InferResponse<typeof POST>;
/** @todo */
const assertResponse: AssertResponse = (json) => {};
const execApi = async (blueprintId: number, payload: Payload) => {
	const json = await fetch(`/agents/blueprints/${blueprintId}/edges/add-edge`, {
		method: "POST",
		body: JSON.stringify(payload),
	}).then((res) => res.json());
	assertResponse(json);
	return json;
};
