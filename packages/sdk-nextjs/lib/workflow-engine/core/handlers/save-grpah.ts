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
	const result = await context.storage.setItem(
		context.workflowId,
		input.workflowData,
		{
			// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
			cacheControlMaxAge: 0,
		},
	);
	if (result === null) {
		throw new Error("Workflow not found");
	}
	return result;
}
