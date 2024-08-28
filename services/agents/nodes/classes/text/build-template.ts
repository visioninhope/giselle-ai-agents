"use server";

import { db, pullMessages, requestPortMessages } from "@/drizzle";
import { logger } from "@trigger.dev/sdk/v3";
import { and, eq } from "drizzle-orm";

type BuildTemplateArgs = {
	requestId: number;
	nodeId: number;
	template: string;
	inputPorts: { name: string; id: number }[];
	outputPortId: number;
};

export const buildTemplate = async ({
	requestId,
	nodeId,
	template,
	inputPorts,
	outputPortId,
}: BuildTemplateArgs) => {
	const messages = await db
		.with(pullMessages)
		.select()
		.from(pullMessages)
		.where(
			and(
				eq(pullMessages.requestId, requestId),
				eq(pullMessages.nodeId, nodeId),
			),
		);

	const regex = /(?<=\{).*?(?=\})/g;
	const matches = Array.from(template.matchAll(regex));
	let finalText = template;
	for (const match of matches) {
		const inputPort = inputPorts.find(({ name }) => name === match[0]);
		if (inputPort == null) {
			logger.log(`inputPort not found for ${match[0]}`);
			continue;
		}
		const message = messages.find(({ portId }) => portId === inputPort.id);
		if (message == null) {
			logger.log(`message not found for ${inputPort.id}`);
			continue;
		}
		finalText = finalText.replace(`{${match[0]}}`, message.content);
	}
	await db.insert(requestPortMessages).values({
		requestId,
		portId: outputPortId,
		message: finalText,
	});
};
