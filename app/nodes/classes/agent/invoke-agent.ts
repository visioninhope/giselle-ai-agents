"use server";

import { type Node, getBlueprint } from "@/app/agents/blueprints";
import {
	type RequestParameter,
	createRequest,
	leaveMessage,
} from "@/app/agents/requests";
import {
	agents,
	db,
	nodeRepresentedAgents,
	portRepresentedAgentPorts,
	pullMessages,
	requestResults,
	requests,
	steps,
} from "@/drizzle";
import { logger, runs } from "@trigger.dev/sdk/v3";
import { and, asc, eq } from "drizzle-orm";
import invariant from "tiny-invariant";

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
	requestId: number;
	node: Node;
	resultPortId: number;
	relevantAgent: {
		id: number;
		blueprintId: number;
	};
};

export const invokeAgent = async ({
	requestId,
	node,
	resultPortId,
	relevantAgent,
}: InvokeAgentArgs) => {
	const messages = await db
		.with(pullMessages)
		.select()
		.from(pullMessages)
		.where(
			and(
				eq(pullMessages.requestId, requestId),
				eq(pullMessages.nodeId, node.id),
			),
		);

	const relevantAgentBlueprint = await getBlueprint(relevantAgent.blueprintId);
	invariant(
		relevantAgentBlueprint.requestInterface != null,
		`No request interface found for blueprint id:${relevantAgent.blueprintId}`,
	);

	const inputs = node.inputPorts.map((inputPort) => ({
		id: inputPort.id,
		name: inputPort.name,
		message: messages.find((m) => m.portId === inputPort.id)?.content ?? "",
	}));

	const requestParameters: RequestParameter[] = [];
	for (const inputPort of node.inputPorts) {
		const relevantAgentInputPort =
			relevantAgentBlueprint.requestInterface.input.find(
				(relevantAgentInput) => relevantAgentInput.name === inputPort.name,
			);
		if (relevantAgentInputPort == null) {
			logger.log(
				`No relevant agent input port found for input port: ${inputPort.name}:${inputPort.id}`,
			);
			continue;
		}
		const message = messages.find(({ portId }) => portId === inputPort.id);
		if (message == null) {
			logger.log(
				`No message found for input port: ${inputPort.name}:${inputPort.id}`,
			);
			continue;
		}
		requestParameters.push({
			port: {
				id: relevantAgentInputPort.portId,
			},
			message: message.content,
		});
	}
	const createdReqesut = await createRequest(
		relevantAgent.blueprintId,
		requestParameters,
	);

	await waitForRun(createdReqesut.triggerRunId);

	const [relevantAgentRequestResult] = await db
		.select({ text: requestResults.text })
		.from(requestResults)
		.where(eq(requestResults.requestId, createdReqesut.requestId));

	logger.log(`messages: ${JSON.stringify({ relevantAgentRequestResult })}`);
	await leaveMessage({
		requestId: requestId,
		portId: resultPortId,
		message: relevantAgentRequestResult.text,
	});
};
