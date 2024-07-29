"use server";

import { blueprints, db, nodesBlueprints } from "@/drizzle";
import { and, eq } from "drizzle-orm";

type UpdateNodePropertyArgs = {
	blueprintId: number;
	node: {
		id: number;
		property: {
			name: string;
			value: string;
		};
	};
};
export const updateNodeProperty = async ({
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
			nodeProperties: nodeBlueprint.nodeProperties.map((nodeProperty) => {
				if (nodeProperty.name !== node.property.name) {
					return nodeProperty;
				}
				return {
					...nodeProperty,
					value: node.property.value,
				};
			}),
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
