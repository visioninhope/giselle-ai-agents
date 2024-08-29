"use server";

import { db, edges, nodes, ports } from "@/drizzle";
import { and, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { portType } from "../nodes/type";

const sourcePorts = alias(ports, "originNodes");
const targetPorts = alias(ports, "destinationNodes");
export const getNextNode = async (nodeDbId: number) => {
	const [node] = await db
		.select({
			dbId: targetPorts.nodeDbId,
		})
		.from(sourcePorts)
		.innerJoin(edges, eq(edges.sourcePortDbId, sourcePorts.dbId))
		.innerJoin(targetPorts, eq(edges.targetPortDbId, targetPorts.dbId))
		.where(
			and(
				eq(sourcePorts.nodeDbId, nodeDbId),
				eq(sourcePorts.type, portType.execution),
			),
		);
	if (node == null) {
		return null;
	}
	return node;
};
