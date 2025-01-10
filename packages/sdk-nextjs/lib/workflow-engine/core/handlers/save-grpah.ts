import { WorkflowData } from "@/lib/workflow-data";
import { z } from "zod";
import type { WorkflowEngineHandlerArgs } from "./types";

const Input = z.object({
	workflowData: WorkflowData,
});
export async function saveGraph({
	context,
	unsafeInput,
}: WorkflowEngineHandlerArgs<z.infer<typeof Input>>) {
	const input = Input.parse(unsafeInput);
	await context.storage.setItem(
		`${context.workflowId}.json`,
		input.workflowData,
		{
			// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
			cacheControlMaxAge: 0,
		},
	);
	const meta = await context.storage.getMeta(`${context.workflowId}.json`);
	console.log(meta);
	return meta;
}
