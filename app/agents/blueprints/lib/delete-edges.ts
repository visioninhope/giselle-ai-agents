"use server";

import { db, edges, edgesBlueprints } from "@/drizzle";
import { and, eq, inArray } from "drizzle-orm";

type DeleteEdgesArgs = {
	blueprintId: number;
	deleteEdgeIds: number[];
};
export const deleteEdges = async ({
	blueprintId,
	deleteEdgeIds,
}: DeleteEdgesArgs) => {
	const deletedEdges = await db
		.delete(edgesBlueprints)
		.where(
			and(
				eq(edgesBlueprints.blueprintId, blueprintId),
				inArray(edgesBlueprints.edgeId, deleteEdgeIds),
			),
		)
		.returning({
			deletedId: edgesBlueprints.edgeId,
		});
	console.log(deletedEdges);
	return deletedEdges.map(({ deletedId }) => deletedId);
};
