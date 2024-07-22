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
import { and, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
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
type PullMessageArgs = {
	requestId: number;
	stepId: number;
};
export const pullMessages = async ({ requestId, stepId }: PullMessageArgs) =>
	await db
		.select({
			nodeClassKey: ports.nodeClassKey,
			content: requestPortMessages.message,
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
		.where(and(eq(requests.id, requestId), eq(steps.id, stepId)));
