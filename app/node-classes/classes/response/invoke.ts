"use server";

import { db, pullMessages } from "@/drizzle";
import { logger } from "@trigger.dev/sdk/v3";
import { and, eq } from "drizzle-orm";
import type { InvokeFunction } from "../../type";

export const invoke: InvokeFunction = async ({ request, id, node }) => {
	logger.log(`params: ${JSON.stringify({ request, id })}`);

	const messages = await db
		.with(pullMessages)
		.select()
		.from(pullMessages)
		.where(
			and(
				eq(pullMessages.requestId, request.id),
				eq(pullMessages.nodeId, Number.parseInt(node.id, 10)),
			),
		);
	logger.log(`messages: ${JSON.stringify(messages)}`);
};
