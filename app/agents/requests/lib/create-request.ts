"use server";

import {
	buildBlueprint,
	copyBlueprint,
	getBlueprint,
} from "@/app/agents/blueprints";
import {
	blueprints,
	db,
	requestSteps,
	requestTriggerRelations,
	requests,
	steps,
} from "@/drizzle";
import { invokeTask } from "@/trigger/invoke";
import { and, asc, eq } from "drizzle-orm";
import invariant from "tiny-invariant";

export const createRequest = async (
	blueprintId: number,
	formData: FormData,
) => {
	const blueprint = await getBlueprint(blueprintId);
	let requestBlueprintId = blueprint.id;
	if (blueprint.dirty) {
		if (!blueprint.builded) {
			await buildBlueprint(blueprint);
			await copyBlueprint(blueprint);
		}
	} else {
		const previousBlueprint = await db.query.blueprints.findFirst({
			where: and(
				eq(blueprints.agentId, blueprint.agent.id),
				eq(blueprints.version, blueprint.version - 1),
			),
		});
		invariant(previousBlueprint != null, "Previous blueprint not found");
		requestBlueprintId = previousBlueprint.id;
	}

	const formEntries = {};
	formData.forEach((value, key) => {
		formData.get(key);
	});

	const [request] = await db
		.insert(requests)
		.values({
			blueprintId: requestBlueprintId,
			status: "creating",
		})
		.returning({ id: requests.id });
	const stepsByBlueprintId = await db.query.steps.findMany({
		where: eq(steps.blueprintId, requestBlueprintId),
		orderBy: asc(steps.order),
	});
	await db.insert(requestSteps).values(
		stepsByBlueprintId.map<typeof requestSteps.$inferInsert>(({ id }) => ({
			requestId: request.id,
			stepId: id,
			status: "idle",
		})),
	);
	const handle = await invokeTask.trigger({
		requestId: request.id,
	});

	await db.insert(requestTriggerRelations).values({
		requestId: request.id,
		triggerId: handle.id,
	});
};
