import { QueuedRun } from "@giselle-sdk/data-type";
import type { z } from "zod";
import { addRun } from "../core/schema";

export async function callAddRunApi({
	api = addRun.defaultApi,
	...input
}: {
	api?: string;
} & z.infer<typeof addRun.Input>) {
	const res = await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(input),
	});
	const data = await res.json();
	const json = addRun.Output.parse(data);
	return {
		run: QueuedRun.parse(json.run),
	};
}
