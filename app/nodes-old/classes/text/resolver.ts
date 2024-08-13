"use server";

import type { Resolver } from "@/app/node-classes";
import {
	db,
	nodes,
	nodesBlueprints,
	pullMessages,
	requestPortMessages,
	requests,
} from "@/drizzle";
import { logger } from "@trigger.dev/sdk/v3";
import { and, eq } from "drizzle-orm";
import invariant from "tiny-invariant";
import { nodeClasses } from "..";

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

	const textProperty = node.properties.find(({ name }) => name === "text");
	invariant(
		textProperty != null,
		`text property not found in node: ${node.id}`,
	);

	const regex = /(?<=\{).*?(?=\})/g;
	const matches = Array.from(textProperty.value.matchAll(regex));
	let finalText = textProperty.value;
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
		(outputPort) => outputPort.name === "Text",
	);
	invariant(targetPort != null, `targetPort not found for ${node.className}`);
	await db.insert(requestPortMessages).values({
		requestId,
		portsBlueprintsId: targetPort.portsBlueprintsId,
		message: finalText,
	});
};
