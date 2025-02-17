import type z from "zod";
import { createOpenAIVectorStore } from "../core/schema";
import type { CallApiParams } from "./types";

export async function callCreateOpenAiVectorStoreApi({
	api = createOpenAIVectorStore.defaultApi,
	workspaceId,
}: CallApiParams<z.infer<typeof createOpenAIVectorStore.Input>>) {
	const response = await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			workspaceId,
		}),
	});
	const data = await response.json();
	return createOpenAIVectorStore.Output.parse(data);
}
