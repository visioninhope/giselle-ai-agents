import { WorkflowData, workflowId } from "@/lib/workflow-data";
import { z } from "zod";
import { workflowDataPath } from "../helpers/workflow-path";
import type { WorkflowEngineHandlerArgs } from "./types";

const Input = z.object({
	workflowId: workflowId.schema,
});
export const Output = z.object({
	workflowData: WorkflowData,
});

export async function getWorkflow({
	context,
	unsafeInput,
}: WorkflowEngineHandlerArgs<z.infer<typeof Input>>) {
	const input = Input.parse(unsafeInput);
	const result = await context.storage.getItem(
		workflowDataPath(input.workflowId),
	);
	if (result === null) {
		throw new Error("Workflow not found");
	}
	console.log(JSON.stringify(result));
	return Output.parse({ workflowData: result });
}
