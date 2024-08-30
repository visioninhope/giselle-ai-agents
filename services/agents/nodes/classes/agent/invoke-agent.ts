"use server";

import { db, pullMessages, requestResults } from "@/drizzle";
import { logger, runs } from "@trigger.dev/sdk/v3";
import { and, eq } from "drizzle-orm";
import { insertRequestPortMessage } from "../../../requests/insert-request-port-message";
import { createRequest } from "../../../requests/process";
import { runOnVercel } from "../../../requests/runners";
import type { Agent } from "../../../types";
import type { Port } from "../../type";

type InvokeAgentArgs = {
	requestDbId: number;
	agent: Agent;
	resultPort: Port;
};

export const invokeAgent = async ({
	requestDbId,
	agent,
	resultPort,
}: InvokeAgentArgs) => {
	const request = await createRequest(agent.buildId);
	await runOnVercel({
		requestId: request.id,
	});
	const [relevantAgentRequestResult] = await db
		.select({ text: requestResults.text })
		.from(requestResults)
		.where(eq(requestResults.requestDbId, request.dbId));
	await insertRequestPortMessage({
		requestDbId,
		portId: resultPort.id,
		message: relevantAgentRequestResult.text,
	});
};
