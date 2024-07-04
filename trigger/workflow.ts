import type { StepWithNode } from "@/app/api/workspaces/[slug]/workflows/types";
import { updateRun, updateRunStep } from "@/drizzle/db";
import { logger, task, wait } from "@trigger.dev/sdk/v3";

export const workflowTask = task({
	id: "workflow",
	run: async (payload: { runId: number; steps: StepWithNode[] }, { ctx }) => {
		logger.log("start workflow", { payload, ctx });
		await updateRun(payload.runId, {
			status: "running",
			startedAt: new Date(),
		});

		for (const step of payload.steps) {
			await updateRunStep(payload.runId, step.id, {
				status: "running",
				startedAt: new Date(),
			});
			logger.log(`${step.node.type} started!!`);
			await wait.for({ seconds: 5 });
			logger.log(`${step.node.type} finished!!`);
			await updateRunStep(payload.runId, step.id, {
				status: "success",
				finishedAt: new Date(),
			});
		}
		await updateRun(payload.runId, {
			status: "success",
			finishedAt: new Date(),
		});

		return {
			message: "Hello, world!",
		};
	},
});
