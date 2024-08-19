"use server";

import { db, nodes } from "@/drizzle";
import { eq } from "drizzle-orm";

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
			.update(nodes)
			.set({
				position: node.position,
			})
			.where(eq(nodes.id, node.id));
	}
	return args;
};
