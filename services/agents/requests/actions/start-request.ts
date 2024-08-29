"use server";

import { blueprints, db, requestStacks, requests } from "@/drizzle";
import { eq } from "drizzle-orm";
import {
	type RequestId,
	getNodeDbId,
	getResponseNode,
	getTriggerNode,
} from "../";

type StartRequestArgs = {
	requestId: RequestId;
};
export const startRequest = async (args: StartRequestArgs) => {
	const [request] = await db
		.select({
			dbId: requests.dbId,
			graph: blueprints.graph,
		})
		.from(requests)
		.innerJoin(blueprints, eq(blueprints.dbId, requests.blueprintDbId))
		.where(eq(requests.id, args.requestId));
	const triggerNode = getTriggerNode(request.graph);
	const responseNode = getResponseNode(request.graph);
	console.log(JSON.stringify(request.graph, null, 2));
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
};
