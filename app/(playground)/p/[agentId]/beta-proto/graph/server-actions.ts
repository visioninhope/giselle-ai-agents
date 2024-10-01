"use server";

import { openai } from "@ai-sdk/openai";
import { type CoreMessage, streamText as sdkStreamText } from "ai";
import { createStreamableValue } from "ai/rsc";

import { getUserSubscriptionId, isRoute06User } from "@/app/(auth)/lib";
import { agents, db } from "@/drizzle";
import { metrics } from "@opentelemetry/api";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import type { AgentId } from "../types";
import type { Graph } from "./types";

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

export async function setGraphToDb(agentId: AgentId, graph: Graph) {
	await db
		.update(agents)
		.set({ graphv2: graph, graphHash: createId() })
		.where(eq(agents.id, agentId));
}
