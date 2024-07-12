import type { Blueprint } from "@/app/agents/blueprints";
import type { InferResponse } from "@/lib/api";
import type { DELETE } from "./route";

type ExpectResponsePayload = InferResponse<typeof DELETE>;
type AssertExpectResponsePayload = (
	json: unknown,
) => asserts json is ExpectResponsePayload;
/** @todo Implement this function */
const assertExpectResponsePayload: AssertExpectResponsePayload = (json) => {};
export const execApi = async (
	blueprint: Blueprint,
	deleteEdgeIds: number[],
) => {
	const json = await fetch(`/agents/${blueprint.agent.urlId}/editor/edges`, {
		method: "DELETE",
		body: JSON.stringify({ deleteEdgeIds }),
	}).then((res) => res.json());
	assertExpectResponsePayload(json);

	return json;
};
