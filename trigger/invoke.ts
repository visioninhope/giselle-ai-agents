import { type Blueprint, getBlueprint } from "@/app/agents/blueprints";
import { getDependedNodes, getRequest } from "@/app/agents/requests";
import { assertNodeClassName, nodeService } from "@/app/nodes";
import { requestResults } from "@/drizzle";
import { db, updateRun, updateRunStep } from "@/drizzle/db";
import { logger, task } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";

type InvokeTaskPayload = {
	requestId: number;
};

const findNode = (blueprint: Blueprint, nodeId: number) => {
	const node = blueprint.nodes.find(({ id }) => id === nodeId);
	invariant(node != null, `Node not found: ${nodeId}`);
	return node;
};

export const invokeTask = task({
	id: "invoke",
	run: async (payload: InvokeTaskPayload, { ctx }) => {
		logger.log("start workflow", { payload, ctx });
		await updateRun(payload.requestId, {
			status: "running",
			startedAt: new Date(),
		});
		const request = await getRequest(payload.requestId);
		if (request == null) {
			throw new Error("No run found");
		}
		const blueprint = await getBlueprint(request.blueprint.id);

		for (const step of request.steps) {
			await updateRunStep(payload.requestId, step.id, {
				status: "running",
				startedAt: new Date(),
			});
			logger.log(`${step.node.className} started!!`);
			const dependedNodes = await getDependedNodes({
				requestId: request.id,
				nodeId: step.node.id,
			});
			for (const dependedNode of dependedNodes) {
				assertNodeClassName(dependedNode.className);
				logger.log(`run resolver for ${dependedNode.className}`);
				await nodeService.runResolver(dependedNode.className, {
					node: findNode(blueprint, dependedNode.id),
					requestId: request.id,
				});
			}
			assertNodeClassName(step.node.className);
			await nodeService.runAction(step.node.className, {
				requestId: request.id,
				node: findNode(blueprint, step.node.id),
			});
			logger.log(`${step.node.className} finished!!`);
			await updateRunStep(payload.requestId, step.id, {
				status: "success",
				finishedAt: new Date(),
			});
		}

		await updateRun(payload.requestId, {
			status: "success",
			finishedAt: new Date(),
		});

		const [result] = await db
			.select()
			.from(requestResults)
			.where(eq(requestResults.requestId, payload.requestId));

		return {
			text: result.text,
		};
	},
});
