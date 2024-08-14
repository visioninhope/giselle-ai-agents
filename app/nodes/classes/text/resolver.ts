"use server";

import type { Resolver } from "@/app/node-classes";
import { db, pullMessages, requestPortMessages } from "@/drizzle";
import { logger } from "@trigger.dev/sdk/v3";
import { and, eq } from "drizzle-orm";
import invariant from "tiny-invariant";

export const resolver: Resolver = async ({ requestId, nodeId, blueprint }) => {
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
	const node = blueprint.nodes.find(({ id }) => id === nodeId);
	invariant(node != null, `node not found: ${nodeId}`);

	const content = node.data?.content as string;

	const regex = /(?<=\{).*?(?=\})/g;
	const matches = Array.from(content.matchAll(regex));
	let finalText = content;
	for (const match of matches) {
		const inputPort = node.inputPorts.find(({ name }) => name === match[0]);
		if (inputPort == null) {
			logger.log(`inputPort not found for ${node.className}.${match[0]}`);
			continue;
		}
		const message = messages.find(({ portId }) => portId === inputPort.id);
		if (message == null) {
			logger.log(
				`message not found for ${node.className}.${inputPort.name}, ${inputPort.id}`,
			);
			continue;
		}
		finalText = finalText.replace(`{${match[0]}}`, message.content);
	}
	const targetPort = node.outputPorts.find(
		(outputPort) => outputPort.name === "text",
	);
	invariant(targetPort != null, `targetPort not found for ${node.className}`);
	await db.insert(requestPortMessages).values({
		requestId,
		portsBlueprintsId: targetPort.portsBlueprintsId,
		message: finalText,
	});
};
