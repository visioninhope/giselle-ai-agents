import { and, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "./db";
import {
	edges,
	edgesBlueprints,
	nodesBlueprints,
	ports,
	portsBlueprints,
	requestPortMessages,
	requests,
	steps,
} from "./schema";

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
export const pullMessages = db.$with("pullMessages").as(
	db
		.select({
			nodeClassKey: ports.nodeClassKey,
			content: sql<string>`${requestPortMessages.message}`.as("content"),
			requestId: sql<number>`${requests.id}`.as("requestId"),
			stepId: sql<number>`${steps.id}`.as("stepId"),
			portId: sql<number>`${ports.id}`.as("portId"),
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
			edgesBlueprints,
			and(
				eq(edgesBlueprints.edgeId, edges.id),
				eq(edgesBlueprints.blueprintId, requests.blueprintId),
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
		),
);
