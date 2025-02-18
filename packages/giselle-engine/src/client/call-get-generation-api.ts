import { Generation } from "@giselle-sdk/data-type";
import type { z } from "zod";
import { getGeneration } from "../core/schema";

export async function callGetGenerationApi({
	api = getGeneration.defaultApi,
	...input
}: {
	api?: string;
} & z.infer<typeof getGeneration.Input>) {
	const response = await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(input),
	});
	const json = await response.json();
	const data = getGeneration.Output.parse(json);
	return Generation.parse(data.generation);
}
