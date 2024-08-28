"use server";

import { blueprints, db, nodes, requests } from "@/drizzle";
import { and, eq } from "drizzle-orm";
import type { Node } from "../nodes";

export const getNodeDbId = async (nodeId: Node["id"], requestDbId: number) => {
	const [node] = await db
		.select({
			dbId: nodes.dbId,
		})
		.from(nodes)
		.innerJoin(requests, eq(requests.blueprintDbId, nodes.blueprintDbId))
		.where(and(eq(nodes.id, nodeId), eq(requests.dbId, requestDbId)));
	return node.dbId;
};
