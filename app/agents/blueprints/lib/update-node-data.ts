"use server";

import { blueprints, db, nodesBlueprints } from "@/drizzle";
import { and, eq } from "drizzle-orm";

type UpdateNodePropertyArgs = {
	blueprintId: number;
	node: {
		id: number;
		data: {
			name: string;
			value: string;
		};
	};
};
export const updateNodeData = async ({
	blueprintId,
	node,
}: UpdateNodePropertyArgs) => {
	const [nodeBlueprint] = await db
		.select()
		.from(nodesBlueprints)
		.where(
			and(
				eq(nodesBlueprints.nodeId, node.id),
				eq(nodesBlueprints.blueprintId, blueprintId),
			),
		);
	await db
		.update(nodesBlueprints)
		.set({
			data: {
				...nodeBlueprint.data,
				[node.data.name]: node.data.value,
			},
		})
		.where(eq(nodesBlueprints.id, nodeBlueprint.id));

	await db
		.update(blueprints)
		.set({ dirty: true })
		.where(eq(blueprints.id, blueprintId));
	return {
		node,
	};
};
