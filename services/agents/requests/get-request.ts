"use server";

import { db, nodes, requestStacks, requestSteps, requests } from "@/drizzle";
import { eq } from "drizzle-orm";
import {
	type Request,
	type RequestId,
	type RequestStack,
	type RequestStackId,
	requestStatus,
} from "./types";

export const getRequest = async (requestId: RequestId) => {
	const [request] = await db
		.select()
		.from(requests)
		.where(eq(requests.id, requestId));
	if (request.status === requestStatus.queued) {
		return null;
	}
	const requestItems = await db
		.select({
			requestStackId: requestStacks.id,
			requestStepId: requestSteps.id,
			requestStepNodeId: nodes.id,
			requestStepStatus: requestSteps.status,
		})
		.from(requestSteps)
		.innerJoin(nodes, eq(requestSteps.nodeDbId, nodes.dbId))
		.innerJoin(
			requestStacks,
			eq(requestSteps.requestStackDbId, requestStacks.dbId),
		)
		.innerJoin(requests, eq(requestStacks.requestDbId, requests.dbId))
		.where(eq(requests.id, requestId));

	const stackMap = new Map<RequestStackId, RequestStack>();

	for (const item of requestItems) {
		const stack = stackMap.get(item.requestStackId);
		if (stack) {
			stack.steps.push({
				id: item.requestStepId,
				nodeId: item.requestStepNodeId,
				status: item.requestStepStatus,
			});
		} else {
			stackMap.set(item.requestStackId, {
				id: item.requestStackId,
				steps: [
					{
						id: item.requestStepId,
						nodeId: item.requestStepNodeId,
						status: item.requestStepStatus,
					},
				],
			});
		}
	}
	return {
		id: requestId,
		stacks: Array.from(stackMap.values()),
		status: request.status,
	} satisfies Request;
};
