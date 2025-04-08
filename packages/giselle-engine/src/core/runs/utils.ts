import { dataMod } from "@giselle-sdk/data-mod";
import {
	Run,
	type RunId,
	type WorkflowId,
	type WorkspaceId,
} from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";
import { getWorkspace } from "../workspaces/utils";

export function runPath(runId: RunId) {
	return `runs/${runId}/run.json`;
}

export async function setRun({
	storage,
	run,
}: {
	storage: Storage;
	run: Run;
}) {
	switch (run.status) {
		case "queued":
			return await storage.set(runPath(run.id), Run.parse(run), {
				// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
				cacheControlMaxAge: 0,
			});
	}
}

function parseAndMod(runLike: unknown, mod = false) {
	const parseResult = Run.safeParse(runLike);
	if (parseResult.success) {
		return parseResult.data;
	}
	if (mod) {
		throw parseResult.error;
	}

	let modData = runLike;
	for (const issue of parseResult.error.issues) {
		modData = dataMod(modData, issue);
	}
	return parseAndMod(modData, true);
}

export async function getRun({
	storage,
	runId,
}: {
	storage: Storage;
	runId: RunId;
}): Promise<Run | undefined> {
	const run = await storage.get(runPath(runId));
	if (run == null) {
		return undefined;
	}
	return parseAndMod(run);
}

export async function getWorkflow({
	storage,
	workspaceId,
	workflowId,
	retryAttempts = 5,
	initialDelay = 1000,
	maxDelay = 10000,
}: {
	storage: Storage;
	workspaceId: WorkspaceId;
	workflowId: WorkflowId;
	retryAttempts?: number;
	initialDelay?: number;
	maxDelay?: number;
}) {
	let currentAttempt = 0;
	let currentDelay = initialDelay;

	while (currentAttempt <= retryAttempts) {
		try {
			const workspace = await getWorkspace({
				storage,
				workspaceId,
			});

			if (workspace === undefined) {
				throw new Error("Workspace not found");
			}

			const workflow = workspace.editingWorkflows.find(
				(editingWorkflow) => editingWorkflow.id === workflowId,
			);

			if (workflow === undefined) {
				throw new Error("Workflow not found");
			}

			return workflow;
		} catch (error) {
			currentAttempt++;

			if (currentAttempt > retryAttempts) {
				throw error;
			}

			// Exponential backoff with jitter
			const jitter = Math.random() * 0.3 + 0.85; // 0.85-1.15 randomization
			currentDelay = Math.min(currentDelay * 2 * jitter, maxDelay);

			// Wait before next attempt
			await new Promise((resolve) => setTimeout(resolve, currentDelay));
		}
	}
	throw new Error("Workflow not found");
}
