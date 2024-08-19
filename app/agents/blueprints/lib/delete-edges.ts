"use server";

import { db, edges } from "@/drizzle";
import { and, eq, inArray } from "drizzle-orm";

type DeleteEdgesArgs = {
	blueprintId: number;
	deleteEdgeIds: number[];
};
export const deleteEdges = async ({ deleteEdgeIds }: DeleteEdgesArgs) => {
	const deletedEdges = await db
		.delete(edges)
		.where(inArray(edges.id, deleteEdgeIds))
		.returning({
			deletedId: edges.id,
		});
	return { deleteEdgeIds: deletedEdges.map(({ deletedId }) => deletedId) };
};
