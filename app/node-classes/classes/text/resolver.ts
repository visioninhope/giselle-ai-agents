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
	const node = blueprint.nodes.find(({ id }) => id === `${nodeId}`);
	invariant(node, `node not found: ${nodeId}`);
	for (const property of node.properties) {
		if (property.value == null) {
			logger.log(`${property.name} is emptry`);
			continue;
		}
		const portKey = node.propertyPortMap[property.name];
		if (portKey == null) {
			logger.log(`targetPort not found for $node.className}.${property.name}`);
			continue;
		}
		const targetPort = node.outputPorts.find(
			(outputPort) => outputPort.nodeClassKey === portKey,
		);
		if (targetPort == null) {
			logger.log(`targetPort not found for ${node.className}.${portKey}`);
			continue;
		}
		const regex = /(?<=\{).*?(?=\})/g;
		const matches = Array.from(property.value.matchAll(regex));
		let finalText = property.value;
		for (const match of matches) {
			const inputPort = node.inputPorts.find(({ name }) => name === match[0]);
			if (inputPort == null) {
				logger.log(`inputPort not found for ${node.className}.${match[0]}`);
				continue;
			}
			const message = messages.find(
				({ portId }) => portId === Number.parseInt(inputPort.id, 10),
			);
			if (message == null) {
				logger.log(
					`message not found for ${node.className}.${inputPort.name}, ${inputPort.id}`,
				);
				continue;
			}
			finalText = finalText.replace(`{${match[0]}}`, message.content);
		}
		await db.insert(requestPortMessages).values({
			requestId,
			portsBlueprintsId: targetPort.portsBlueprintsId,
			message: finalText,
		});
	}
};
