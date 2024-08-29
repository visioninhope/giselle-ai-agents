import {
	blueprints,
	db,
	requestStacks,
	requestSteps,
	requests,
} from "@/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { and, asc, eq } from "drizzle-orm";
import { getNextNode } from "./get-next-node";
import { getNodeDbId } from "./get-node-id";
import { getResponseNode, getTriggerNode } from "./helpers";

type CreateRequestStackArgs = {
	requestDbId: number;
};
export async function* createRequestStackGenerator(
	args: CreateRequestStackArgs,
) {
	const [request] = await db
		.select({
			dbId: requests.dbId,
			graph: blueprints.graph,
		})
		.from(requests)
		.innerJoin(blueprints, eq(blueprints.dbId, requests.blueprintDbId))
		.where(eq(requests.dbId, args.requestDbId));

	const triggerNode = getTriggerNode(request.graph);
	const responseNode = getResponseNode(request.graph);
	if (triggerNode == null || responseNode == null) {
		throw new Error("Required node not found");
	}

	const triggerNodeDbId = await getNodeDbId(triggerNode.id, request.dbId);
	const responseNodeDbId = await getNodeDbId(responseNode.id, request.dbId);

	const [newRequestStack] = await db
		.insert(requestStacks)
		.values({
			requestDbId: request.dbId,
			startNodeDbId: triggerNodeDbId,
			endNodeDbId: responseNodeDbId,
		})
		.returning({
			dbId: requestStacks.dbId,
		});

	yield newRequestStack;
}

export async function* runStackGenerator(requestStackDbId: number) {
	const [requestStack] = await db
		.select()
		.from(requestStacks)
		.where(eq(requestStacks.dbId, requestStackDbId));

	const nextNode = await getNextNode(requestStack.startNodeDbId);
	await db.insert(requestSteps).values({
		id: `rqst.stp_${createId()}`,
		requestStackDbId,
		nodeDbId: nextNode.dbId,
	});

	while (true) {
		const [step] = await getFirstIdleStep(requestStackDbId);
		if (step == null) break;
		yield step;
	}
}

async function getFirstIdleStep(requestStackDbId: number) {
	return await db
		.select({ dbId: requestSteps.dbId })
		.from(requestSteps)
		.where(
			and(
				eq(requestSteps.requestStackDbId, requestStackDbId),
				eq(requestSteps.status, "idle"),
			),
		)
		.orderBy(asc(requestSteps.dbId))
		.limit(1);
}

export async function runStep(requestStepDbId: number) {
	await db
		.update(requestSteps)
		.set({
			status: "success",
		})
		.where(eq(requestSteps.dbId, requestStepDbId));
}
