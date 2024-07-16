import type { InferResponse } from "@/lib/api";
import { useCallback, useState } from "react";
import type { AgentRequest } from "../agent-request";
import type { POST, Payload } from "./route";

type UseCreateRequestActionArgs = {
	onRequestCreated?: (request: AgentRequest) => void;
};
export const useCreateRequestAction = (args?: UseCreateRequestActionArgs) => {
	const [optimisticdata, setOptimisticdata] = useState<
		AgentRequest | undefined
	>(undefined);
	const createRequest = useCallback(
		async (payload: Payload) => {
			setOptimisticdata({
				blueprint: {
					id: payload.blueprintId,
				},
				id: 0,
				status: "creating",
				steps: [],
			});
			const agentRequest = await execApi(payload);
			args?.onRequestCreated?.(agentRequest);
		},
		[args],
	);
	return { createRequest };
};

type AssertResponse = (
	response: unknown,
) => asserts response is InferResponse<typeof POST>;
/** @todo */
const assertResponse: AssertResponse = (response) => {};
const execApi = async (payload: Payload) => {
	const json = await fetch("/agents/requests/create-request", {
		method: "POST",
		body: JSON.stringify(payload),
	}).then((res) => res.json());
	assertResponse(json);
	return json;
};
