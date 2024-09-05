"use server";

import { getUserSubscriptionId } from "@/app/(auth)/lib";
import { db, pullMessages, requestPortMessages } from "@/drizzle";
import { openai } from "@/lib/openai";
import { insertRequestPortMessage } from "@/services/agents/requests/insert-request-port-message";
import { metrics } from "@opentelemetry/api";
import { and, eq } from "drizzle-orm";
import type { Port } from "../../types";

const meter = metrics.getMeter("OpenAI");
const tokenCounter = meter.createCounter("token_consumed", {
	description: "Number of OpenAI API tokens consumed by each request",
});

type AssertContent = (value: unknown) => asserts value is string;
const asssertContent: AssertContent = () => {};

type ActionArgs = {
	requestDbId: number;
	nodeDbId: number;
	instructionPort: Port;
	resultPort: Port;
};

export const generateText = async ({
	requestDbId,
	nodeDbId,
	instructionPort,
	resultPort,
}: ActionArgs) => {
	const [instructionMessage] = await db
		.with(pullMessages)
		.select()
		.from(pullMessages)
		.where(
			and(
				eq(pullMessages.requestDbId, requestDbId),
				eq(pullMessages.nodeDbId, nodeDbId),
				eq(pullMessages.portId, instructionPort.id),
			),
		);
	const content = instructionMessage.content;
	asssertContent(content);
	const completion = await openai.chat.completions.create({
		messages: [
			{ role: "system", content: "You are a helpful assistant." },
			{ role: "user", content },
		],
		model: "gpt-4o-mini",
	});
	await insertRequestPortMessage({
		requestDbId,
		portId: resultPort.id,
		message: completion.choices[0].message.content ?? "",
	});
	if (completion.usage && completion.usage.total_tokens !== undefined) {
		tokenCounter.add(completion.usage.total_tokens, {
			subscriptionId: await getUserSubscriptionId(),
		});
	}
};
