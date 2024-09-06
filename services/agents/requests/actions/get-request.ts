"use server";

import {
	db,
	edges,
	nodes,
	ports,
	requestPortMessages,
	requestStacks,
	requestSteps,
	requests,
} from "@/drizzle";
import { asc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import {
	type Request,
	type RequestId,
	type RequestStack,
	type RequestStackId,
	requestStatus,
} from "../types";

const targetPorts = alias(ports, "target_ports");
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
			requestStepNodeDbId: requestSteps.nodeDbId,
			requestStepNodeGraph: nodes.graph,
			requestStepStatus: requestSteps.status,
		})
		.from(requestSteps)
		.innerJoin(nodes, eq(requestSteps.nodeDbId, nodes.dbId))
		.innerJoin(
			requestStacks,
			eq(requestSteps.requestStackDbId, requestStacks.dbId),
		)
		.innerJoin(requests, eq(requestStacks.requestDbId, requests.dbId))
		.where(eq(requests.id, requestId))
		.orderBy(asc(requestSteps.dbId));
	const outgoingPortMessages = await db
		.select({
			portId: ports.id,
			nodeDbId: ports.nodeDbId,
			message: requestPortMessages.message,
		})
		.from(requestPortMessages)
		.innerJoin(ports, eq(requestPortMessages.portDbId, ports.dbId))
		.innerJoin(requests, eq(requestPortMessages.requestDbId, requests.dbId))
		.where(eq(requests.id, requestId));
	const incomingPortMessages = await db
		.select({
			portId: targetPorts.id,
			nodeDbId: targetPorts.nodeDbId,
			message: requestPortMessages.message,
		})
		.from(requestPortMessages)
		.innerJoin(ports, eq(requestPortMessages.portDbId, ports.dbId))
		.innerJoin(edges, eq(ports.dbId, edges.sourcePortDbId))
		.innerJoin(targetPorts, eq(targetPorts.dbId, edges.targetPortDbId))
		.innerJoin(requests, eq(requestPortMessages.requestDbId, requests.dbId))
		.where(eq(requests.id, requestId));

	const stackMap = new Map<RequestStackId, RequestStack>();

	for (const item of requestItems) {
		const stack = stackMap.get(item.requestStackId);
		const portMessages = [
			...outgoingPortMessages
				.filter(
					(portMessage) => portMessage.nodeDbId === item.requestStepNodeDbId,
				)
				.map(({ portId, message }) => ({
					portId,
					message: message as string,
				})),
			...incomingPortMessages
				.filter(
					(portMessage) => portMessage.nodeDbId === item.requestStepNodeDbId,
				)
				.map(({ portId, message }) => ({
					portId,
					message: message as string,
				})),
		];
		stackMap.set(item.requestStackId, {
			id: item.requestStackId,
			steps: [
				...(stack?.steps ?? []),
				{
					id: item.requestStepId,
					node: item.requestStepNodeGraph,
					status: item.requestStepStatus,
					portMessages,
				},
			],
		});
	}
	return {
		id: requestId,
		stacks: Array.from(stackMap.values()),
		status: request.status,
	} satisfies Request;
};
