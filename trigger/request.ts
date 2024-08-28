import {
	blueprints,
	db,
	requestStacks,
	requestSteps,
	requests,
} from "@/drizzle";
import {
	getNextNode,
	getNodeDbId,
	getResponseNode,
	getTriggerNode,
} from "@/services/agents/requests";
import { task } from "@trigger.dev/sdk/v3";
import { and, asc, eq } from "drizzle-orm";

type RequestArgs = {
	requestDbId: number;
};

export const requestRunner = task({
	id: "requestRunner",
	run: async (args: RequestArgs) => {
		const [request] = await db
			.select({
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
		const triggerNodeDbId = await getNodeDbId(triggerNode.id, args.requestDbId);
		const responseNodeDbId = await getNodeDbId(
			responseNode.id,
			args.requestDbId,
		);
		const [newRequestStack] = await db
			.insert(requestStacks)
			.values({
				requestDbId: args.requestDbId,
				startNodeDbId: triggerNodeDbId,
				endNodeDbId: responseNodeDbId,
			})
			.returning({
				dbId: requestStacks.dbId,
			});
		await requestStackRunner.triggerAndWait({
			requestStackDbId: newRequestStack.dbId,
		});
	},
});

const getFirstIdleStep = async (requestStackDbId: number) =>
	await db
		.select()
		.from(requestSteps)
		.where(
			and(
				eq(requestSteps.requestStackDbId, requestStackDbId),
				eq(requestSteps.status, "idle"),
			),
		)
		.orderBy(asc(requestSteps.dbId))
		.limit(1);
type RequestStackRunnerArgs = {
	requestStackDbId: number;
};
export const requestStackRunner = task({
	id: "requestStackRunner",
	run: async (args: RequestStackRunnerArgs) => {
		const [requestStack] = await db
			.select()
			.from(requestStacks)
			.where(eq(requestStacks.dbId, args.requestStackDbId));
		const nextNode = await getNextNode(requestStack.startNodeDbId);
		await db.insert(requestSteps).values({
			requestStackDbId: args.requestStackDbId,
			nodeDbId: nextNode.dbId,
		});
		let step = await getFirstIdleStep(args.requestStackDbId);
		while (step == null) {
			step = await getFirstIdleStep(args.requestStackDbId);
		}
	},
});

type RequestStepRunnerArgs = {
	requestStepDbId: number;
};
export const requestStepRunner = task({
	id: "requestStepRunner",
	run: async (args: RequestStepRunnerArgs) => {
		const [requestStep] = await db
			.select()
			.from(requestSteps)
			.where(eq(requestSteps.dbId, args.requestStepDbId));
		await db
			.update(requestSteps)
			.set({
				status: "running",
			})
			.where(eq(requestSteps.dbId, args.requestStepDbId));

		await db
			.update(requestSteps)
			.set({
				status: "success",
			})
			.where(eq(requestSteps.dbId, args.requestStepDbId));
	},
});
