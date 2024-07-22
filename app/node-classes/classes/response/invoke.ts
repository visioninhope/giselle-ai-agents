"use server";

import { pullMessages } from "@/app/agents/requests";
import { logger } from "@trigger.dev/sdk/v3";
import type { InvokeFunction } from "../../type";

export const invoke: InvokeFunction = async ({ request, id }) => {
	logger.log(`params: ${JSON.stringify({ request, id })}`);

	const messages = await pullMessages({ requestId: request.id, stepId: id });
	logger.log(`messages: ${JSON.stringify(messages)}`);
};
