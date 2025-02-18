import { QueuedGeneration } from "@giselle-sdk/data-type";
import { z } from "zod";
import { addGeneration } from "../core/schema";

export async function callAddGenerationApi({
	api = addGeneration.defaultApi,
	...input
}: {
	api?: string;
} & z.infer<typeof addGeneration.Input>) {
	const response = await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(input),
	});
	const json = await response.json();
	const data = addGeneration.Output.parse(json);
	return z
		.object({
			generation: QueuedGeneration,
		})
		.parse({
			generation: QueuedGeneration.parse(data.generation),
		});
}
