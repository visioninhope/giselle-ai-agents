"use server";

import { type Blueprint, inferSteps } from "@/app/agents/blueprints";
import {
	blueprints as blueprintsSchema,
	db,
	knowledgeContents,
	knowledgeOpenaiVectorStoreRepresentations,
	knowledges,
	steps as stepsSchema,
} from "@/drizzle";
import { setExpirationPolicy } from "@/services/knowledges/actions";
import { eq } from "drizzle-orm";

export const buildBlueprint = async (blueprint: Blueprint) => {
	const inferedSteps = inferSteps(blueprint);
	const insertedProcesses = await db
		.insert(stepsSchema)
		.values(
			inferedSteps.map(({ nodeId, order }) => ({
				nodeId,
				order,
				blueprintId: blueprint.id,
			})),
		)
		.returning({
			insertedId: stepsSchema.id,
			nodeId: stepsSchema.nodeId,
		});
	const currentKnowledges = await db
		.select({
			openaiVectorStoreId:
				knowledgeOpenaiVectorStoreRepresentations.openaiVectorStoreId,
		})
		.from(knowledges)
		.innerJoin(
			knowledgeOpenaiVectorStoreRepresentations,
			eq(knowledgeOpenaiVectorStoreRepresentations.knowledgeId, knowledges.id),
		);
	for (const currentKnowledge of currentKnowledges) {
		await setExpirationPolicy({
			vectorStoreId: currentKnowledge.openaiVectorStoreId,
			expirationPolicy: {
				anchor: "last_active_at",
				days: 1,
			},
		});
	}
	await db
		.update(blueprintsSchema)
		.set({ builded: true })
		.where(eq(blueprintsSchema.id, blueprint.id));
};
