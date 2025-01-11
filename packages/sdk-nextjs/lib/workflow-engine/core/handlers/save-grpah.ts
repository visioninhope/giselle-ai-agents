import { WorkflowData, workflowId } from "@/lib/workflow-data";
import { z } from "zod";
import { setGraphToStorage } from "../helpers/set-graph-to-storage";
import type { WorkflowEngineHandlerArgs } from "./types";

const Input = z.object({
	workflowId: workflowId.schema,
	workflowData: WorkflowData,
});
export async function saveGraph({
	context,
	unsafeInput,
}: WorkflowEngineHandlerArgs<z.infer<typeof Input>>) {
	const input = Input.parse(unsafeInput);
	setGraphToStorage({
		storage: context.storage,
		workflowId: input.workflowId,
		workflowData: input.workflowData,
	});
	const meta = await context.storage.getMeta(`${input.workflowId}.json`);
	return meta;
}
