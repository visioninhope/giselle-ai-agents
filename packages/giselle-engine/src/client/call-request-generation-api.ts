import type { z } from "zod";
import { requestGeneration } from "../core/schema";

const Input = requestGeneration.Input;
type Input = z.infer<typeof Input>;
export async function callRequestGenerationApi({
	api = requestGeneration.defaultApi,
	...input
}: {
	api?: string;
} & Input) {
	await fetch(api, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(requestGeneration.Input.parse(input)),
	});
}
