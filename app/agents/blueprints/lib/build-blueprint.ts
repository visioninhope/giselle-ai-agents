"use server";

import { type Blueprint, inferSteps } from "@/app/agents/blueprints";
import {
	blueprints as blueprintsSchema,
	db,
	steps as stepsSchema,
} from "@/drizzle";
import { eq } from "drizzle-orm";

export const buildBlueprint = async (blueprint: Blueprint) => {
	const inferedSteps = inferSteps(blueprint);
	const insertedProcesses = await db
		.insert(stepsSchema)
		.values(
			inferedSteps.map(({ nodeId, order }) => ({
				nodeId: Number.parseInt(nodeId, 10),
				order,
				blueprintId: blueprint.id,
			})),
		)
		.returning({
			insertedId: stepsSchema.id,
			nodeId: stepsSchema.nodeId,
		});
	await db
		.update(blueprintsSchema)
		.set({ builded: true })
		.where(eq(blueprintsSchema.id, blueprint.id));
};
