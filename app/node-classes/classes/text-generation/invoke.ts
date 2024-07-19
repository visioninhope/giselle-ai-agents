"use server";

import {
	db,
	edges,
	nodesBlueprints,
	ports,
	portsBlueprints,
	requestPortMessages,
	requests,
	steps,
} from "@/drizzle";
import { logger, wait } from "@trigger.dev/sdk/v3";
import { and, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { InvokeFunction } from "../../type";

const originPortsBlueprints = alias(portsBlueprints, "originPortsBlueprints");
const originNodesBlueprints = alias(nodesBlueprints, "originNodesBlueprints");
const destinationPortsBlueprints = alias(
	portsBlueprints,
	"destinationPortsBlueprints",
);
const destinationNodesBlueprints = alias(
	nodesBlueprints,
	"destinationNodesBlueprints",
);
export const invoke: InvokeFunction = async ({ request, id }) => {
	logger.log("text generation started...");
	logger.log(`params: ${JSON.stringify({ request, id })}`);
	const messages = await db
		.select({
			message: requestPortMessages.message,
		})
		.from(requestPortMessages)
		.innerJoin(requests, eq(requests.id, requestPortMessages.requestId))
		.innerJoin(
			originPortsBlueprints,
			eq(originPortsBlueprints.id, requestPortMessages.portsBlueprintsId),
		)
		.innerJoin(
			originNodesBlueprints,
			eq(originNodesBlueprints.id, originPortsBlueprints.nodesBlueprintsId),
		)
		.innerJoin(
			edges,
			and(
				eq(edges.outputPortId, originPortsBlueprints.portId),
				eq(edges.edgeType, "data"),
			),
		)
		.innerJoin(
			destinationPortsBlueprints,
			eq(destinationPortsBlueprints.portId, edges.inputPortId),
		)
		.innerJoin(ports, eq(ports.id, destinationPortsBlueprints.portId))
		.innerJoin(
			destinationNodesBlueprints,
			and(
				eq(
					destinationNodesBlueprints.id,
					destinationPortsBlueprints.nodesBlueprintsId,
				),
				eq(
					destinationNodesBlueprints.blueprintId,
					originNodesBlueprints.blueprintId,
				),
			),
		)
		.innerJoin(
			steps,
			and(
				eq(steps.nodeId, destinationNodesBlueprints.nodeId),
				eq(steps.blueprintId, destinationNodesBlueprints.blueprintId),
			),
		)
		.where(and(eq(requests.id, request.id), eq(steps.id, id)));
	logger.log(`messages: ${JSON.stringify(messages)}`);
	await wait.for({ seconds: 5 });
};
