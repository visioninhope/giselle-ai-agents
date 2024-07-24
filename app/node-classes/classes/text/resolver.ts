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
		await db.insert(requestPortMessages).values({
			requestId,
			portsBlueprintsId: targetPort.portsBlueprintsId,
			message: property.value,
		});
	}
};
