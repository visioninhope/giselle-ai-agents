"use server";

import { db, nodesBlueprints } from "@/drizzle";
import { and, eq } from "drizzle-orm";

type UpdateNodePropertyArgs = {
	blueprintId: number;
	nodeId: number;
	property: {
		name: string;
		value: string;
	};
};
export const updateNodeProperty = async ({
	blueprintId,
	nodeId,
	property,
}: UpdateNodePropertyArgs) => {
	const [nodeBlueprint] = await db
		.select()
		.from(nodesBlueprints)
		.where(
			and(
				eq(nodesBlueprints.nodeId, nodeId),
				eq(nodesBlueprints.blueprintId, blueprintId),
			),
		);
	await db
		.update(nodesBlueprints)
		.set({
			nodeProperties: nodeBlueprint.nodeProperties.map((nodeProperty) => {
				if (nodeProperty.name !== property.name) {
					return nodeProperty;
				}
				return {
					...nodeProperty,
					value: property.value,
				};
			}),
		})
		.where(eq(nodesBlueprints.id, nodeBlueprint.id));
	return { property };
};
