"use server";

import { openai } from "@ai-sdk/openai";
import { type CoreMessage, streamText as sdkStreamText } from "ai";
import { createStreamableValue } from "ai/rsc";

import { getUserSubscriptionId, isRoute06User } from "@/app/(auth)/lib";
import { metrics } from "@opentelemetry/api";

export async function streamText(messages: CoreMessage[]) {
	const result = await sdkStreamText({
		model: openai("gpt-4-turbo"),
		messages,
		onFinish: async (result) => {
			const meter = metrics.getMeter("OpenAI");
			const tokenCounter = meter.createCounter("token_consumed", {
				description: "Number of OpenAI API tokens consumed by each request",
			});
			const subscriptionId = await getUserSubscriptionId();
			const isR06User = await isRoute06User();
			tokenCounter.add(result.usage.totalTokens, {
				subscriptionId,
				isR06User,
			});
		},
	});

	const stream = createStreamableValue(result.textStream);
	return stream.value;
}
