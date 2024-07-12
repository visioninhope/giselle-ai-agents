import type { Blueprint } from "@/app/agents/blueprints";

type ExpectResponsePayload = {
	deletedNodeIds: number[];
};
type AssertExpectResponsePayload = (
	json: unknown,
) => asserts json is ExpectResponsePayload;
/** @todo Implement this function */
const assertExpectResponsePayload: AssertExpectResponsePayload = (json) => {};
export const execApi = async (
	blueprint: Blueprint,
	deleteNodeIds: number[],
) => {
	const json = await fetch(
		`/agents/${blueprint.agent.urlId}/use-editor/nodes`,
		{
			method: "DELETE",
			body: JSON.stringify({ deleteNodeIds }),
		},
	).then((res) => res.json());
	assertExpectResponsePayload(json);

	return json;
};
