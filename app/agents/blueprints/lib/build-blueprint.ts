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
			inferedSteps.map((process) => ({
				...process,
				blueprintId: blueprint.id,
			})),
		)
		.returning({
			insertedId: stepsSchema.id,
			nodeId: stepsSchema.nodeId,
		});
	const dataEdges = blueprint.edges.filter(
		({ edgeType }) => edgeType === "data",
	);
	for (const dataEdge of dataEdges) {
		const inputProcess = insertedProcesses.find(
			({ nodeId }) => nodeId === dataEdge.inputPort.nodeId,
		);
		const outputProcess = insertedProcesses.find(
			({ nodeId }) => nodeId === dataEdge.outputPort.nodeId,
		);
	}
	await db
		.update(blueprintsSchema)
		.set({ builded: true })
		.where(eq(blueprintsSchema.id, blueprint.id));
};
