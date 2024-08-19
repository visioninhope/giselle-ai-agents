import { eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "./db";
import { edges, ports, requestPortMessages, requests } from "./schema";

const originPorts = alias(ports, "originPorts");
const destinationPorts = alias(ports, "destinationPorts");
export const pullMessages = db.$with("pullMessages").as(
	db
		.select({
			content: sql<string>`${requestPortMessages.message}`.as("content"),
			requestId: sql<number>`${requests.id}`.as("requestId"),
			portId: sql<number>`${destinationPorts.id}`.as("portId"),
			nodeId: sql<number>`${destinationPorts.nodeId}`.as("nodeId"),
		})
		.from(requestPortMessages)
		.innerJoin(requests, eq(requests.id, requestPortMessages.requestId))
		.innerJoin(originPorts, eq(originPorts.id, requestPortMessages.portId))
		.innerJoin(edges, eq(edges.outputPortId, originPorts.id))
		.innerJoin(destinationPorts, eq(destinationPorts.id, edges.inputPortId)),
);
// export const pullMessages = db.$with("pullMessages").as(
// 	db
// 		.select({
// 			content: sql<string>`${requestPortMessages.message}`.as("content"),
// 			requestId: sql<number>`${requests.id}`.as("requestId"),
// 			nodeId: sql<number>`${destinationNodesBlueprints.nodeId}`.as("nodeId"),
// 			portId: sql<number>`${ports.id}`.as("portId"),
// 		})
// 		.from(requestPortMessages)
// 		.innerJoin(requests, eq(requests.id, requestPortMessages.requestId))
// 		.innerJoin(
// 			originPorts,
// 			eq(originPorts.id, requestPortMessages.portsBlueprintsId),
// 		)
// 		.innerJoin(
// 			originNodes,
// 			eq(originNodes.id, originPorts.nodesBlueprintsId),
// 		)
// 		.innerJoin(
// 			edges,
// 			and(
// 				eq(edges.outputPortId, originPorts.portId),
// 				eq(edges.edgeType, "data"),
// 			),
// 		)
// 		.innerJoin(
// 			edgesBlueprints,
// 			and(
// 				eq(edgesBlueprints.edgeId, edges.id),
// 				eq(edgesBlueprints.blueprintId, requests.blueprintId),
// 			),
// 		)
// 		.innerJoin(
// 			destinationPortsBlueprints,
// 			eq(destinationPortsBlueprints.portId, edges.inputPortId),
// 		)
// 		.innerJoin(ports, eq(ports.id, destinationPortsBlueprints.portId))
// 		.innerJoin(
// 			destinationNodesBlueprints,
// 			and(
// 				eq(
// 					destinationNodesBlueprints.id,
// 					destinationPortsBlueprints.nodesBlueprintsId,
// 				),
// 				eq(
// 					destinationNodesBlueprints.blueprintId,
// 					originNodes.blueprintId,
// 				),
// 			),
// 		),
// );
