import { getBlueprint } from "@/app/agents/blueprints";
import { getDependedNodes, getRequest } from "@/app/agents/requests";
import { getInvokeFunction, getResolver } from "@/app/node-classes";
import { requestPortMessages } from "@/drizzle";
import { db, updateRun, updateRunStep } from "@/drizzle/db";
import { logger, task } from "@trigger.dev/sdk/v3";

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
		// const dataNodes = blueprint.nodes.filter(
		// 	({ inputPorts, outputPorts }) =>
		// 		!inputPorts.some(({ type }) => type === "execution") &&
		// 		!outputPorts.some(({ type }) => type === "execution"),
		// );
		// for (const dataNode of dataNodes) {
		// 	for (const property of dataNode.properties) {
		// 		const portKey = dataNode.propertyPortMap[property.name];
		// 		if (portKey == null) {
		// 			logger.log(
		// 				`targetPort not found for ${dataNode.className}.${property.name}`,
		// 			);
		// 			continue;
		// 		}
		// 		const targetPort = dataNode.outputPorts.find(
		// 			(outputPort) => outputPort.nodeClassKey === portKey,
		// 		);
		// 		if (targetPort == null) {
		// 			logger.log(
		// 				`targetPort not found for ${dataNode.className}.${portKey}`,
		// 			);
		// 			continue;
		// 		}
		// 		await db.insert(requestPortMessages).values({
		// 			requestId: payload.requestId,
		// 			portsBlueprintsId: targetPort.portsBlueprintsId,
		// 			message: property.value,
		// 		});
		// 	}
		// }

		for (const step of request.steps) {
			await updateRunStep(payload.requestId, step.id, {
				status: "running",
				startedAt: new Date(),
			});
			logger.log(`${step.node.className} started!!`);
			const dependedNodes = await getDependedNodes({
				requestId: request.id,
				nodeId: Number.parseInt(step.node.id, 10),
			});
			for (const dependedNode of dependedNodes) {
				const resolver = getResolver(dependedNode.className);
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
			const invokeFunction = getInvokeFunction(step.node.className);
			if (invokeFunction == null) {
				logger.log(`invokeFunction not implemented for ${step.node.className}`);
			} else {
				await invokeFunction(step);
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

		return {
			message: "Hello, world!",
		};
	},
});
