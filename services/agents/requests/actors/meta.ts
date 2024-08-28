"use server";

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

type RequestTaskArgs = {
	requestDbId: number;
};
export const meta = async (args: RequestTaskArgs) => {
	const [request] = await db
		.select({
			graph: blueprints.graph,
		})
		.from(requests)
		.innerJoin(blueprints, eq(blueprints.dbId, requests.blueprintDbId))
		.where(eq(requests.dbId, args.requestDbId));
	const triggerNode = getTriggerNode(request.graph);
	const responseNode = getResponseNode(request.graph);
	console.log(JSON.stringify(request.graph, null, 2));
	if (triggerNode == null || responseNode == null) {
		throw new Error("Required node not found");
	}
	const triggerNodeDbId = await getNodeDbId(triggerNode.id, args.requestDbId);
	const responseNodeDbId = await getNodeDbId(responseNode.id, args.requestDbId);
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
};
