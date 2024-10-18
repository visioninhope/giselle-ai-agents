"use server";

import { getUserSubscriptionId, isRoute06User } from "@/app/(auth)/lib";
import { openai } from "@ai-sdk/openai";
import { metrics } from "@opentelemetry/api";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import Langfuse from "langfuse";
import { webSearchSchema } from "./schema";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface GenerateWebSearchStreamInputs {
	userPrompt: string;
	systemPrompt?: string;
}
export async function generateWebSearchStream(
	inputs: GenerateWebSearchStreamInputs,
) {
	const lf = new Langfuse();
	const trace = lf.trace({
		id: `giselle-${Date.now()}`,
	});
	const stream = createStreamableValue();

	(async () => {
		const model = "gpt-4o-mini";
		const generation = trace.generation({
			input: inputs.userPrompt,
			model,
		});
		const { partialObjectStream, object } = await streamObject({
			model: openai(model),
			system: inputs.systemPrompt ?? "You generate an answer to a question. ",
			prompt: inputs.userPrompt,
			schema: webSearchSchema,
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
			console.log(partialObject);
			stream.update(partialObject);
		}

		const result = await object;

		await sleep(500);
		stream.update({
			...result,
			webSearch: {
				name: "Why Deno is the best choice for biginner",
			},
		});

		await sleep(1000);
		stream.update({
			...result,
			webSearch: {
				name: "Why Deno is the best choice for biginner",
				items: [
					{
						id: "wbs.cnt_1",
						title: "Deno vs Node.js: A Detailed Comparison",
						url: "https://www.freecodecamp.org/news/deno-vs-node-js/",
						status: "pending",
					},
				],
			},
		});

		await sleep(1000);
		stream.update({
			...result,
			webSearch: {
				name: "Why Deno is the best choice for biginner",
				items: [
					{
						id: "wbs.cnt_1",
						title: "Deno Beginner",
						url: "https://denobeginner.com/",
						status: "completed",
					},
					{
						id: "wbs.cnt_2",
						title: "Intro to Deno – Guide for Beginners",
						url: "https://www.freecodecamp.org/news/intro-to-deno/",
						status: "processing",
					},
				],
			},
		});
		await sleep(1000);
		stream.update({
			...result,
			webSearch: {
				name: "Why Deno is the best choice for biginner",
				items: [
					{
						id: "wbs.cnt_1",
						title: "Deno Beginner",
						url: "https://denobeginner.com/",
						status: "completed",
					},
					{
						id: "wbs.cnt_2",
						title: "Intro to Deno – Guide for Beginners",
						url: "https://www.freecodecamp.org/news/intro-to-deno/",
						status: "completed",
					},
				],
				status: "completed",
			},
			description:
				"Deno is a runtime for JavaScript and TypeScript that is based on the V8 JavaScript engine and the Rust programming language. It was created by Ryan Dahl, the original creator of Node.js, and was designed to address some of the shortcomings of Node.js. Deno is designed to be secure by default, with no file, network, or environment access unless explicitly enabled. It also has built-in support for TypeScript, which makes it easier to write and maintain large codebases. Deno is still relatively new compared to Node.js, but it has been gaining popularity among developers who are looking for a more secure and modern alternative to Node.js.",
		});

		stream.done();
	})();

	return { object: stream.value };
}
