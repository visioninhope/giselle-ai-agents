"use server";

import { db, nodes, nodesBlueprints } from "@/drizzle";
import { and, eq } from "drizzle-orm";

type UpdateNodesPositionArgs = {
	blueprintId: number;
	nodes: Array<{
		id: number;
		position: { x: number; y: number };
	}>;
};
export const updateNodesPosition = async (args: UpdateNodesPositionArgs) => {
	for (const node of args.nodes) {
		await db
			.update(nodesBlueprints)
			.set({
				position: node.position,
			})
			.where(
				and(
					eq(nodesBlueprints.blueprintId, args.blueprintId),
					eq(nodesBlueprints.id, node.id),
				),
			);
	}
	return args;
};
