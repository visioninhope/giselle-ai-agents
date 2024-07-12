import { db } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { asc, desc, eq } from "drizzle-orm";
import invariant from "tiny-invariant";
import type { AgentRequest } from "../models/agent-process";

export const getAgentRequest = async (
	requestId: number,
): Promise<AgentRequest> => {
	const request = await db.query.requests.findFirst({
		columns: {
			blueprintId: true,

			id: true,
			status: true,
		},
		where: eq(schema.requests.id, requestId),
	});
	invariant(request != null, `Request not found with id: ${request}`);
	const blueprintId = request.blueprintId;

	const nodes = await db.query.nodes.findMany({
		columns: {
			id: true,
			type: true,
		},
		where: eq(schema.nodes.blueprintId, blueprintId),
	});
	const steps = await db.query.steps.findMany({
		columns: {
			id: true,
			nodeId: true,
		},
		where: eq(schema.steps.blueprintId, blueprintId),
		orderBy: asc(schema.steps.order),
	});
	const requestSteps = await db.query.requestStep.findMany({
		columns: {
			id: true,
			stepId: true,
			status: true,
		},
		where: eq(schema.requestStep.runId, request.id),
	});
	const requestStepsWithNode = steps.map(({ id, nodeId }) => {
		const node = nodes.find((n) => n.id === nodeId);
		const requestStep = requestSteps.find(
			(runProcess) => runProcess.stepId === id,
		);
		invariant(node != null, `No node found for process ${id}`);
		invariant(requestStep != null, `No run process found for process ${id}`);
		return {
			id,
			node: {
				id: node.id,
				type: node.type,
			},
			status: requestStep.status,
			run: {
				id: requestStep.id,
			},
		};
	});
	return {
		request: {
			blueprint: {
				id: blueprintId,
			},
			id: request.id,
			status: request.status,
			processes: requestStepsWithNode,
		},
	};
};
