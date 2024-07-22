"use server";

import { leaveMessage, pullMessages } from "@/app/agents/requests";
import type { InvokeFunction } from "@/app/node-classes";
import { logger, wait } from "@trigger.dev/sdk/v3";
import OpenAI from "openai";

const openai = new OpenAI();

type AssertContent = (value: unknown) => asserts value is string;
const asssertContent: AssertContent = (value) => {};

export const invoke: InvokeFunction = async ({ request, id }) => {
	logger.log(`params: ${JSON.stringify({ request, id })}`);
	const messages = await pullMessages({ requestId: request.id, stepId: id });
	const instructionMessage = messages.find(
		({ nodeClassKey }) => nodeClassKey === "instruction",
	);
	if (instructionMessage == null) {
		logger.log(
			`instruction message not found in messages: ${JSON.stringify(messages)}`,
		);
	} else {
		const content = instructionMessage.content;
		asssertContent(content);
		const completion = await openai.chat.completions.create({
			messages: [
				{ role: "system", content: "You are a helpful assistant." },
				{ role: "user", content },
			],
			model: "gpt-4o-mini",
		});
		logger.log(`completion: ${JSON.stringify(completion)}`);
		await leaveMessage({
			requestId: request.id,
			port: { nodeClassKey: "result" },
			stepId: id,
			message: completion.choices[0].message.content ?? "",
		});
	}
};
