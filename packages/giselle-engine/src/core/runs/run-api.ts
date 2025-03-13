import {
	type CreatedRun,
	GenerationId,
	type JobId,
	type QueuedGeneration,
	RunId,
	type WorkflowId,
	type WorkspaceId,
} from "@giselle-sdk/data-type";
import { generateText } from "../generations";
import type { GiselleEngineContext } from "../types";
import { addRun } from "./add-run";
import { startRun } from "./start-run";

export async function runApi(args: {
	workspaceId: WorkspaceId;
	workflowId: WorkflowId;
	context: GiselleEngineContext;
}) {
	const runId = RunId.generate();
	const createdRun = {
		id: runId,
		status: "created",
		createdAt: Date.now(),
	} satisfies CreatedRun;
	const run = await addRun({ ...args, run: createdRun });
	await startRun({
		runId,
		context: args.context,
	});
	const jobResults: Record<JobId, string[]> = {};
	for (const job of run.workflow.jobs) {
		const jobResult = await Promise.all(
			job.actions.map(async (action) => {
				const generationId = GenerationId.generate();
				const generation = {
					id: generationId,
					context: {
						...action.generationTemplate,
						origin: { type: "run", id: runId },
					},
					status: "queued",
					createdAt: Date.now(),
					ququedAt: Date.now(),
				} satisfies QueuedGeneration;
				const streamTextResult = await generateText({
					context: args.context,
					generation,
				});
				await streamTextResult.consumeStream();
				return await streamTextResult.text;
			}),
		);
		jobResults[job.id] = jobResult;
	}
	return jobResults[run.workflow.jobs[run.workflow.jobs.length - 1].id].join(
		"/n",
	);
}
