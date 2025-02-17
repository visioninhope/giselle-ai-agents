import type { QueuedRun, RunId, WorkspaceId } from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";
import type { z } from "zod";
import { createWorkspace, getWorkspace } from "../helpers";
import { setRun } from "../helpers/run";
import { addRun } from "../schema";
import type { GiselleEngineHandlerArgs } from "./types";

const Input = addRun.Input;
type Input = z.infer<typeof Input>;
const Output = addRun.Output;

export async function addRunHandler({
	unsafeInput,
	context,
}: GiselleEngineHandlerArgs<Input>) {
	const input = Input.parse(unsafeInput);
	const workspace = await getWorkspace({
		storage: context.storage,
		workspaceId: input.workspaceId,
	});

	if (workspace === undefined) {
		throw new Error("Workspace not found");
	}
	const workflow = workspace.editingWorkflows.find(
		(editingWorkflow) => editingWorkflow.id === input.workflowId,
	);
	if (workflow === undefined) {
		throw new Error("Workflow not found");
	}

	const runWorkspace = await createWorkspace();
	/** @todo upload openai file to vector store */
	const queuedRun = {
		...input.run,
		status: "queued",
		workspaceId: runWorkspace.id,
		workflow,
		queuedAt: Date.now(),
	} satisfies QueuedRun;
	await Promise.all([
		setRun({ run: queuedRun, storage: context.storage }),
		copyFiles({
			storage: context.storage,
			workspaceId: input.workspaceId,
			runId: queuedRun.id,
		}),
	]);
	return Output.parse({ run: queuedRun });
}

async function copyFiles({
	storage,
	workspaceId,
	runId,
}: { storage: Storage; workspaceId: WorkspaceId; runId: RunId }) {
	const fileKeys = await storage.getKeys(`workspaces/${workspaceId}/files`);

	await Promise.all(
		fileKeys.map(async (fileKey) => {
			const dest = fileKey.replace(
				/workspaces:wrks-\w+:files:/,
				`runs:rs-${runId}:files:`,
			);
			const file = await storage.getItemRaw(fileKey);
			await storage.setItemRaw(
				fileKey.replace(/workspaces:wrks-\w+:files:/, `runs:${runId}:files:`),
				file,
			);
		}),
	);
}
