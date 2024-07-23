"use server";

import { db, nodesBlueprints } from "@/drizzle";
import { and, eq, inArray } from "drizzle-orm";

type DeleteNodesArgs = {
	blueprintId: number;
	deleteNodeIds: number[];
};
export const deleteNodes = async ({
	blueprintId,
	deleteNodeIds,
}: DeleteNodesArgs) => {
	await db
		.delete(nodesBlueprints)
		.where(
			and(
				eq(nodesBlueprints.blueprintId, blueprintId),
				inArray(nodesBlueprints.nodeId, deleteNodeIds),
			),
		);
};
