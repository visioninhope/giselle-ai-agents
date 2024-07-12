import type { Blueprint } from "@/app/agents/blueprints";
import type { InferResponse } from "@/lib/api";
import type { POST, PostPayload } from "./route";

type ExpectResponsePayload = InferResponse<typeof POST>;
type AssertExpectResponsePayload = (
	json: unknown,
) => asserts json is ExpectResponsePayload;
/** @todo Implement this function */
const assertExpectResponsePayload: AssertExpectResponsePayload = (json) => {};
export const execApi = async (blueprint: Blueprint, payload: PostPayload) => {
	const json = await fetch(`/agents/${blueprint.agent.urlId}/editor/edges`, {
		method: "POST",
		body: JSON.stringify(payload),
	}).then((res) => res.json());
	assertExpectResponsePayload(json);
	return json;
};
