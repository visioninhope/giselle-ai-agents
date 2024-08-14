import { getBlueprint } from "@/app/agents/blueprints";
import { getDependedNodes, getRequest } from "@/app/agents/requests";
import { getResolver } from "@/app/node-classes";
import { assertNodeClassName, nodeFactory } from "@/app/nodes";
import { requestPortMessages, requestResults } from "@/drizzle";
import { db, updateRun, updateRunStep } from "@/drizzle/db";
import { logger, task } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";

type InvokeTaskPayload = {
	requestId: number;
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
				const resolver = nodeFactory.getResolver(dependedNode.className);
				if (resolver == null) {
					logger.log(`resolver not implemented for ${dependedNode.className}`);
				} else {
					logger.log(
						`resolver found for ${dependedNode.className}, node id: ${dependedNode.id}`,
					);
					await resolver({
						requestId: request.id,
						nodeId: dependedNode.id,
						blueprint,
					});
				}
			}
			assertNodeClassName(step.node.className);
			const action = nodeFactory.getAction(step.node.className);
			if (action == null) {
				logger.log(`action not implemented for ${step.node.className}`);
			} else {
				await action(step);
			}
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
