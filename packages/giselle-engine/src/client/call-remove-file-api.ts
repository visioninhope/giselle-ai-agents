import type { z } from "zod";
import { removeFile } from "../core/schema";
import type { CallApiParams } from "./types";

type Input = z.infer<typeof removeFile.Input>;
export async function callRemoveFileApi({
	api = removeFile.defaultApi,
	...input
}: CallApiParams<Input>) {
	await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(input),
	});
}
