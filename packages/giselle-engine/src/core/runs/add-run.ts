import {
	type CreatedRun,
	type FileNode,
	type OverrideNode,
	type QueuedRun,
	type WorkflowId,
	type WorkspaceId,
	isFileNode,
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
			queuedRun,
		}),
	]);
	return queuedRun;
}

async function copyFiles({
	storage,
	queuedRun,
}: { storage: Storage; queuedRun: QueuedRun }) {
	const files: FileNode[] = [];
	for (const node of queuedRun.workflow.nodes) {
		if (!isFileNode(node)) {
			continue;
		}
		files.push(node);
	}
	await Promise.all(
		files.map(async (file) => {
			const fileContent = await storage.getItemRaw(file.id);
			await storage.setItemRaw(
				file.id.replace(
					/workspaces:wrks-\w+:files:/,
					`runs:${queuedRun.id}:files:`,
				),
				fileContent,
			);
		}),
	);
}
