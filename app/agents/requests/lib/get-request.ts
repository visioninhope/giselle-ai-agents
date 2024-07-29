"use server";

import type { AgentRequest } from "@/app/agents/requests";
import {
	db,
	nodesBlueprints,
	nodes as nodesSchema,
	ports,
	portsBlueprints,
	pullMessages,
	requestPortMessages,
	requestSteps as requestStepsSchema,
	requests,
	requests as requestsSchema,
	steps as stepsSchema,
} from "@/drizzle";
import { and, asc, eq, inArray } from "drizzle-orm";
import invariant from "tiny-invariant";

export const getRequest = async (requestId: number): Promise<AgentRequest> => {
	const request = await db.query.requests.findFirst({
		columns: {
			blueprintId: true,
			id: true,
			status: true,
		},
		where: eq(requestsSchema.id, requestId),
	});
	invariant(request != null, `Request not found with id: ${request}`);
	const blueprintId = request.blueprintId;

	const dbNodes = await db
		.select({
			id: nodesSchema.id,
			className: nodesSchema.className,
			position: nodesSchema.position,
		})
		.from(nodesSchema)
		.innerJoin(nodesBlueprints, eq(nodesBlueprints.nodeId, nodesSchema.id))
		.where(eq(nodesBlueprints.blueprintId, blueprintId));
	const steps = await db.query.steps.findMany({
		columns: {
			id: true,
			nodeId: true,
		},
		where: eq(stepsSchema.blueprintId, blueprintId),
		orderBy: asc(stepsSchema.order),
	});
	const requestSteps = await db.query.requestSteps.findMany({
		columns: {
			id: true,
			stepId: true,
			status: true,
		},
		where: eq(requestStepsSchema.requestId, request.id),
	});
	const inputMessages = await db
		.with(pullMessages)
		.select({
			nodeId: pullMessages.nodeId,
			portId: pullMessages.portId,
			content: pullMessages.content,
		})
		.from(pullMessages)
		.where(
			and(
				eq(pullMessages.requestId, request.id),
				inArray(
					pullMessages.nodeId,
					steps.map(({ nodeId }) => nodeId),
				),
			),
		);
	const outputMessages = await db
		.select({
			nodeId: nodesBlueprints.nodeId,
			portId: portsBlueprints.portId,
			content: requestPortMessages.message,
		})
		.from(requestPortMessages)
		.innerJoin(requests, eq(requests.id, requestPortMessages.requestId))
		.innerJoin(
			portsBlueprints,
			eq(portsBlueprints.id, requestPortMessages.portsBlueprintsId),
		)
		.innerJoin(
			nodesBlueprints,
			and(
				eq(nodesBlueprints.blueprintId, requests.blueprintId),
				eq(nodesBlueprints.id, portsBlueprints.nodesBlueprintsId),
			),
		)
		.where(eq(requestPortMessages.requestId, requestId));

	const requestStepsWithNode = steps.map(({ id, nodeId }) => {
		const node = dbNodes.find((n) => n.id === nodeId);
		const requestStep = requestSteps.find(
			(runProcess) => runProcess.stepId === id,
		);
		invariant(node != null, `No node found for process ${id}`);
		invariant(requestStep != null, `No run process found for process ${id}`);
		return {
			id,
			node: {
				id: node.id,
				className: node.className,
			},
			status: requestStep.status,
			request: {
				id: request.id,
			},
			requestStep: {
				id: requestStep.id,
				input: inputMessages
					.filter(({ nodeId }) => nodeId === node.id)
					.map(({ content, portId }) => ({
						value: content,
						portId,
					})),
				output: outputMessages
					.filter(({ nodeId }) => nodeId === node.id)
					.map(({ content, portId }) => ({
						value: `${content}`,
						portId,
					})),
			},
		};
	});
	return {
		blueprint: {
			id: blueprintId,
		},
		id: request.id,
		status: request.status,
		steps: requestStepsWithNode,
	};
};
