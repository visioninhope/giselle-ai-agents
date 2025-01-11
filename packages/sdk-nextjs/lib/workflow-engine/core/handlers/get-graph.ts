import { WorkflowData, workflowId } from "@/lib/workflow-data";
import { z } from "zod";
import type { WorkflowEngineHandlerArgs } from "./types";

const Input = z.object({
	workflowId: workflowId.schema,
});
export async function getGraph({
	context,
	unsafeInput,
}: WorkflowEngineHandlerArgs<z.infer<typeof Input>>) {
	const input = Input.parse(unsafeInput);
	const result = await context.storage.getItem(`${input.workflowId}.json`);
	if (result === null) {
		throw new Error("Workflow not found");
	}
	return WorkflowData.parse(result);
}
