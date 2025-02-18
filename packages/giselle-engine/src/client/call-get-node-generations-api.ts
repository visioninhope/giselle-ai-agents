import type { z } from "zod";
import { getNodeGenerations } from "../core/schema";

export async function callGetNodeGenerationsApi({
	api = getNodeGenerations.defaultApi,
	...input
}: {
	api?: string;
} & z.infer<typeof getNodeGenerations.Input>) {
	const response = await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(input),
	});
	const json = await response.json();
	return getNodeGenerations.Output.parse(json);
}
