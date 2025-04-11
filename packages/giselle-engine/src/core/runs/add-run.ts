import type {
	CreatedRun,
	OverrideNode,
	QueuedRun,
	RunId,
	WorkflowId,
	WorkspaceId,
} from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";
import type { GiselleEngineContext } from "../types";
import { getWorkflow, overrideGenerationTemplate, setRun } from "./utils";

export async function addRun(args: {
	workspaceId: WorkspaceId;
	workflowId: WorkflowId;
	run: CreatedRun;
	overrideNodes: OverrideNode[];
	context: GiselleEngineContext;
}) {
	const workflow = await getWorkflow({
		storage: args.context.storage,
		workspaceId: args.workspaceId,
		workflowId: args.workflowId,
	});

	const overrideWorkflow = {
		...workflow,
		jobs: workflow.jobs.map((job) => ({
			...job,
			actions: job.actions.map((action) => ({
				...action,
				generationTemplate: overrideGenerationTemplate(
					action.generationTemplate,
					args.overrideNodes ?? [],
				),
			})),
		})),
	};

	/** @todo upload openai file to vector store */
	const queuedRun = {
		...args.run,
		status: "queued",
		workspaceId: args.workspaceId,
		workflow: overrideWorkflow,
		overrideNodes: args.overrideNodes,
		queuedAt: Date.now(),
	} satisfies QueuedRun;
	await Promise.all([
		setRun({ run: queuedRun, storage: args.context.storage }),
		copyFiles({
			storage: args.context.storage,
			workspaceId: args.workspaceId,
			runId: queuedRun.id,
		}),
	]);
	return queuedRun;
}

async function copyFiles({
	storage,
	workspaceId,
	runId,
}: { storage: Storage; workspaceId: WorkspaceId; runId: RunId }) {
	const fileKeys = await storage.getKeys(`workspaces/${workspaceId}/files`);

	await Promise.all(
		fileKeys.map(async (fileKey) => {
			const file = await storage.getItemRaw(fileKey);
			await storage.setItemRaw(
				fileKey.replace(/workspaces:wrks-\w+:files:/, `runs:${runId}:files:`),
				file,
			);
		}),
	);
}
