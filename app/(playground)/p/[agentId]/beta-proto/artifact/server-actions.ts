"use server";

import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";

import { getUserSubscriptionId, isRoute06User } from "@/app/(auth)/lib";
import { metrics } from "@opentelemetry/api";
import { Langfuse } from "langfuse";
import { schema as artifactSchema } from "../artifact/schema";
import type { SourceIndex } from "../source/types";
import { sourceIndexesToSources } from "../source/utils";
import type { AgentId } from "../types";

type GenerateArtifactStreamParams = {
	agentId: AgentId;
	userPrompt: string;
	systemPrompt?: string;
	sourceIndexes: SourceIndex[];
};
export async function generateArtifactStream(
	params: GenerateArtifactStreamParams,
) {
	const lf = new Langfuse();
	const trace = lf.trace({
		id: `giselle-${Date.now()}`,
	});
	const sources = sourceIndexesToSources({
		input: {
			agentId: params.agentId,
			sourceIndexes: params.sourceIndexes,
		},
	});
	const stream = createStreamableValue();

	(async () => {
		const model = "gpt-4o";
		const generation = trace.generation({
			input: params.userPrompt,
			model,
		});
		const { partialObjectStream, object } = await streamObject({
			model: openai(model),
			system: params.systemPrompt ?? "You generate an answer to a question. ",
			prompt: params.userPrompt,
			schema: artifactSchema,
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
				await lf.shutdownAsync();
			},
		});

		for await (const partialObject of partialObjectStream) {
			stream.update(partialObject);
		}

		const result = await object;

		stream.done();
	})();

	return { object: stream.value };
}
