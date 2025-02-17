import type { z } from "zod";
import { startRun } from "../core/schema";

export async function callStartRunApi({
	api = startRun.defaultApi,
	...input
}: {
	api?: string;
} & z.infer<typeof startRun.Input>) {
	await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(input),
	});
}
