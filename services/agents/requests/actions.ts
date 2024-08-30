import {
	builds,
	db,
	nodes,
	requestStacks,
	requestSteps,
	requests,
} from "@/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { and, asc, eq } from "drizzle-orm";
import { assertNodeClassName, nodeService } from "../nodes";
import { getDependedNodes } from "./get-depended-nodes";
import { getNextNode } from "./get-next-node";
import { getNodeDbId } from "./get-node-id";
import { getResponseNode, getTriggerNode } from "./helpers";
import { type RequestStatus, requestStatus, requestStepStatus } from "./types";

export const updateRequestStatus = async (
	requestDbId: number,
	status: RequestStatus,
) => {
	await db
		.update(requests)
		.set({
			status,
		})
		.where(eq(requests.dbId, requestDbId));
};

type CreateRequestStackArgs = {
	requestDbId: number;
};
export async function* createRequestStackGenerator(
	args: CreateRequestStackArgs,
) {
	const [request] = await db
		.select({
			dbId: requests.dbId,
			graph: builds.graph,
		})
		.from(requests)
		.innerJoin(builds, eq(builds.dbId, requests.buildDbId))
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
			id: `rqst.stck_${createId()}`,
			requestDbId: request.dbId,
			startNodeDbId: triggerNodeDbId,
			endNodeDbId: responseNodeDbId,
		})
		.returning({
			dbId: requestStacks.dbId,
		});

	yield newRequestStack;
}

const pushNextNodeToRequestStack = async (
	requestStackDbId: number,
	currentNodeDbId: number,
) => {
	const nextNode = await getNextNode(currentNodeDbId);
	if (nextNode == null) {
		return;
	}
	await db.insert(requestSteps).values({
		id: `rqst.stp_${createId()}`,
		requestStackDbId,
		nodeDbId: nextNode.dbId,
	});
};

export async function* runStackGenerator(requestStackDbId: number) {
	const [requestStack] = await db
		.select()
		.from(requestStacks)
		.where(eq(requestStacks.dbId, requestStackDbId));

	await pushNextNodeToRequestStack(
		requestStackDbId,
		requestStack.startNodeDbId,
	);

	while (true) {
		const [step] = await getFirstQueuedStep(requestStackDbId);
		if (step == null) break;
		yield step;
	}
}

async function getFirstQueuedStep(requestStackDbId: number) {
	return await db
		.select({ dbId: requestSteps.dbId })
		.from(requestSteps)
		.where(
			and(
				eq(requestSteps.requestStackDbId, requestStackDbId),
				eq(requestSteps.status, requestStepStatus.queued),
			),
		)
		.orderBy(asc(requestSteps.dbId))
		.limit(1);
}

export async function runStep(
	requestDbId: number,
	requestStackDbId: number,
	requestStepDbId: number,
) {
	await db
		.update(requestSteps)
		.set({
			status: requestStepStatus.inProgress,
		})
		.where(eq(requestSteps.dbId, requestStepDbId));
	const [node] = await db
		.select({
			id: nodes.id,
			dbId: nodes.dbId,
			className: nodes.className,
			graph: nodes.graph,
		})
		.from(nodes)
		.innerJoin(requestSteps, eq(nodes.dbId, requestSteps.nodeDbId))
		.where(eq(requestSteps.dbId, requestStepDbId));
	const dependedNodes = await getDependedNodes({
		requestDbId,
		nodeDbId: node.dbId,
	});
	for (const dependedNode of dependedNodes) {
		assertNodeClassName(dependedNode.className);
		await nodeService.runResolver(dependedNode.className, {
			requestDbId,
			nodeDbId: dependedNode.dbId,
			node: dependedNode.graph,
		});
	}
	assertNodeClassName(node.className);
	await nodeService.runAction(node.className, {
		requestDbId,
		nodeDbId: node.dbId,
		node: node.graph,
	});
	await pushNextNodeToRequestStack(requestStackDbId, node.dbId);
	await db
		.update(requestSteps)
		.set({
			status: requestStepStatus.completed,
		})
		.where(eq(requestSteps.dbId, requestStepDbId));
}
