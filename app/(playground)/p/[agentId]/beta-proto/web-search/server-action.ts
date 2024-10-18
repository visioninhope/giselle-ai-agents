"use server";

import { getUserSubscriptionId, isRoute06User } from "@/app/(auth)/lib";
import { openai } from "@ai-sdk/openai";
import FirecrawlApp from "@mendable/firecrawl-js";
import { metrics } from "@opentelemetry/api";
import { createId } from "@paralleldrive/cuid2";
import { put } from "@vercel/blob";
import { streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import Langfuse from "langfuse";
import type { GiselleNode } from "../giselle-node/types";
import { webSearchSchema } from "./schema";
import { search } from "./tavily";
import { type WebSearch, webSearchItemStatus, webSearchStatus } from "./types";

interface GenerateWebSearchStreamInputs {
	userPrompt: string;
	systemPrompt?: string;
	node: GiselleNode;
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
			stream.update(partialObject);
		}

		const result = await object;

		const searchResults = await Promise.all(
			result.keywords.map((keyword) => search(keyword)),
		).then((results) => [...new Set(results.flat())]);

		const webSearch: WebSearch = {
			id: `wbs_${createId()}`,
			generatedNodeId: inputs.node.id,
			object: "webSearch",
			name: result.name,
			status: "pending",
			items: searchResults.map((searchResult) => ({
				id: `wbs.cnt_${createId()}`,
				object: "webSearch.item.reference",
				title: searchResult.title,
				url: searchResult.url,
				status: "pending",
			})),
		};

		stream.update({
			...result,
			webSearch,
		});

		if (process.env.FIRECRAWL_API_KEY === undefined) {
			throw new Error("FIRECRAWL_API_KEY is not set");
		}
		const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
		let mutableItems = webSearch.items;
		await Promise.all(
			webSearch.items.map(async (webSearchItem) => {
				const scrapeResponse = await app.scrapeUrl(webSearchItem.url, {
					formats: ["markdown"],
				});
				if (scrapeResponse.success) {
					const blob = await put(
						`webSearch/${webSearchItem.id}.md`,
						scrapeResponse.markdown ?? "",
						{
							access: "public",
							contentType: "text/markdown",
						},
					);
					mutableItems = mutableItems.map((item) => {
						if (item.id !== webSearchItem.id) {
							return item;
						}
						return {
							...webSearchItem,
							contentBlobUrl: blob.url,
							status: webSearchItemStatus.completed,
						};
					});
					stream.update({
						...result,
						webSearch: {
							...webSearch,
							items: mutableItems,
						},
					});
				}
			}),
		);
		stream.update({
			...result,
			webSearch: {
				...webSearch,
				status: webSearchStatus.completed,
				items: mutableItems,
			},
		});

		stream.done();
	})();

	return { object: stream.value };
}
