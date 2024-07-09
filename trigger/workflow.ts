import type { StepWithNode } from "@/app/api/workspaces/[slug]/workflows/types";
import {
	leaveMessage,
	pullMessages,
	updateRun,
	updateRunStep,
} from "@/drizzle/db";
import { logger, task, wait } from "@trigger.dev/sdk/v3";

type WorkflowTaskPayload = {
	runId: number;
	steps: StepWithNode[];
};
type WorkflowStepPayload = {
	runId: number;
	step: StepWithNode;
};

export const workflowTask = task({
	id: "workflow",
	run: async (payload: WorkflowTaskPayload, { ctx }) => {
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
			if (step.node.type === "FindUser") {
				await findUser({ runId: payload.runId, step });
			}
			if (step.node.type === "SendMail") {
				await sendMail({ runId: payload.runId, step });
			}
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

const findUser = async ({ runId, step }: WorkflowStepPayload) => {
	logger.log("finding user...");
	await wait.for({ seconds: 3 });
	logger.log("user found!!");
	await leaveMessage(runId, step.id, [
		{
			portName: "user",
			value: "John Doe",
		},
	]);
};

const sendMail = async ({ runId, step }: WorkflowStepPayload) => {
	logger.log("sending mail...");
	const messages = await pullMessages(runId, step.id);
	for (const message of messages) {
		logger.log(`${message.portName} => ${message.message}`);
		message.portName;
	}
};
