"use server";

import { db, nodes } from "@/drizzle";
import { and, eq, inArray } from "drizzle-orm";

type DeleteNodesArgs = {
	blueprintId: number;
	deleteNodeIds: number[];
};
export const deleteNodes = async ({ deleteNodeIds }: DeleteNodesArgs) => {
	await db.delete(nodes).where(inArray(nodes.id, deleteNodeIds));
	return {
		deleteNodeIds,
	};
};
