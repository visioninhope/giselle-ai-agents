"use server";

import { db, nodes, ports, pullMessages, requestResults } from "@/drizzle";
import { logger } from "@trigger.dev/sdk/v3";
import { and, eq } from "drizzle-orm";
import type { Action } from "../../type";

export const action: Action = async ({ request, id, node }) => {
	logger.log(`params: ${JSON.stringify({ request, id })}`);

	const [outputPort] = await db
		.select({ id: ports.id, name: ports.name })
		.from(ports)
		.innerJoin(nodes, eq(ports.nodeId, nodes.id))
		.where(and(eq(nodes.id, node.id), eq(ports.name, "output")));
	const [outputMessage] = await db
		.with(pullMessages)
		.select()
		.from(pullMessages)
		.where(
			and(
				eq(pullMessages.requestId, request.id),
				eq(pullMessages.nodeId, node.id),
				eq(pullMessages.portId, outputPort.id),
			),
		);
	// logger.log(`messages: ${JSON.stringify(messages)}`);

	// const output = messages.find(({ portId }) => portId === "output");
	// if (output == null) {
	// 	logger.log(
	// 		`output message not found in messages: ${JSON.stringify(messages)}`,
	// 	);
	// 	return;
	// }
	await db.insert(requestResults).values({
		requestId: request.id,
		text: outputMessage.content,
	});
};
