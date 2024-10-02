"use server";

import { openai } from "@ai-sdk/openai";
import {
	type CoreMessage,
	streamText as sdkStreamText,
	streamObject,
} from "ai";
import { createStreamableValue } from "ai/rsc";

import { getUserSubscriptionId, isRoute06User } from "@/app/(auth)/lib";
import { agents, db } from "@/drizzle";
import { metrics } from "@opentelemetry/api";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { schema } from "../artifact/schema";
import type { AgentId } from "../types";
import type { Graph } from "./types";
import { Langfuse } from 'langfuse'

export async function generateObjectStream(prompt: string) {
	const lf = new Langfuse();
	lf.debug(true);
	const trace = lf.trace({
		id: `giselle-${Date.now()}`,
	});
	const stream = createStreamableValue();

	(async () => {
		const model = "gpt-4o-mini";
		const generation = trace.generation({
			input: prompt,
			model,
		});
		const { partialObjectStream } = await streamObject({
			model: openai(model),
			system: "You generate an answer to a question. ",
			prompt,
			schema,
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
				generation.end({
					output: result,
				});
			},
		});

		for await (const partialObject of partialObjectStream) {
			stream.update(partialObject);
		}

		stream.done();
	})();

	return { object: stream.value };
}

export async function setGraphToDb(agentId: AgentId, graph: Graph) {
	await db
		.update(agents)
		.set({ graphv2: graph, graphHash: createId() })
		.where(eq(agents.id, agentId));
}
