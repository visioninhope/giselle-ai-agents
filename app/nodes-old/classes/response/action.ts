"use server";

import { db, pullMessages, requestResults } from "@/drizzle";
import { logger } from "@trigger.dev/sdk/v3";
import { and, eq } from "drizzle-orm";
import type { Action } from "../../type";

export const action: Action = async ({ request, id, node }) => {
	logger.log(`params: ${JSON.stringify({ request, id })}`);

	const messages = await db
		.with(pullMessages)
		.select()
		.from(pullMessages)
		.where(
			and(
				eq(pullMessages.requestId, request.id),
				eq(pullMessages.nodeId, node.id),
			),
		);
	logger.log(`messages: ${JSON.stringify(messages)}`);

	const output = messages.find(({ nodeClassKey }) => nodeClassKey === "output");
	if (output == null) {
		logger.log(
			`output message not found in messages: ${JSON.stringify(messages)}`,
		);
		return;
	}
	await db.insert(requestResults).values({
		requestId: request.id,
		text: output.content,
	});
};
