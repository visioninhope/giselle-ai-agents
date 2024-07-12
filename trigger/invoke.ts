import { type RequestStep, getAgentRequest } from "@/app/agents/requests";
import {
	leaveMessage,
	pullMessages,
	updateRun,
	updateRunStep,
} from "@/drizzle/db";
import { logger, task, wait } from "@trigger.dev/sdk/v3";

type InvokeTaskPayload = {
	requestId: number;
};

export const invokeTask = task({
	id: "invoke",
	run: async (payload: InvokeTaskPayload, { ctx }) => {
		logger.log("start workflow", { payload, ctx });
		await updateRun(payload.requestId, {
			status: "running",
			startedAt: new Date(),
		});
		const agentProcess = await getAgentRequest(payload.requestId);
		if (agentProcess.run == null) {
			throw new Error("No run found");
		}

		for (const process of agentProcess.run.processes) {
			await updateRunStep(payload.requestId, process.id, {
				status: "running",
				startedAt: new Date(),
			});
			logger.log(`${process.node.type} started!!`);
			if (process.node.type === "FindUser") {
				await findUser(process);
			}
			if (process.node.type === "SendMail") {
				await sendMail(process);
			}
			await wait.for({ seconds: 5 });
			logger.log(`${process.node.type} finished!!`);
			await updateRunStep(payload.requestId, process.id, {
				status: "success",
				finishedAt: new Date(),
			});
		}

		await updateRun(payload.requestId, {
			status: "success",
			finishedAt: new Date(),
		});

		return {
			message: "Hello, world!",
		};
	},
});

const findUser = async ({ run, id }: RequestStep) => {
	logger.log("finding user...");
	await wait.for({ seconds: 3 });
	logger.log("user found!!");
	await leaveMessage(run.id, id, [
		{
			portName: "user",
			value: "John Doe",
		},
	]);
};

const sendMail = async ({ run, id }: RequestStep) => {
	logger.log("sending mail...");
	const messages = await pullMessages(run.id, id);
	for (const message of messages) {
		logger.log(`${message.portName} => ${message.message}`);
		message.portName;
	}
};
