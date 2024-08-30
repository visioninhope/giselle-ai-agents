"use server";

import { db, pullMessages, requestResults } from "@/drizzle";
import { logger, runs } from "@trigger.dev/sdk/v3";
import { and, eq } from "drizzle-orm";
import { insertRequestPortMessage } from "../../../requests/insert-request-port-message";
import { createRequest } from "../../../requests/process";
import { runOnVercel } from "../../../requests/runners";
import type { Agent } from "../../../types";
import type { Port } from "../../type";

const waitForRun = async (
	runId: string,
	maxAttempts = 120,
	interval = 1000,
): Promise<void> => {
	let attempts = 0;

	while (attempts < maxAttempts) {
		logger.log(`attempt: ${attempts}`);
		const run = await runs.retrieve(runId);
		logger.log(JSON.stringify(run.attempts));

		switch (run.status) {
			case "COMPLETED":
				return;
			case "FAILED":
				throw new Error("Run failed");
			case "CANCELED":
				throw new Error("Run was cancelled");
			default:
				// If the status is still pending or in progress, we continue waiting
				await new Promise((resolve) => setTimeout(resolve, interval));
				attempts++;
		}
	}

	// If we've exceeded the maximum number of attempts, we throw an error
	throw new Error(
		`Timeout: Run did not complete within ${(maxAttempts * interval) / 1000} seconds`,
	);
};

type InvokeAgentArgs = {
	requestDbId: number;
	nodeDbId: number;
	agent: Agent;
	resultPort: Port;
};

export const invokeAgent = async ({
	requestDbId,
	nodeDbId,
	agent,
	resultPort,
}: InvokeAgentArgs) => {
	const messages = await db
		.with(pullMessages)
		.select()
		.from(pullMessages)
		.where(
			and(
				eq(pullMessages.requestDbId, requestDbId),
				eq(pullMessages.nodeDbId, nodeDbId),
			),
		);

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
