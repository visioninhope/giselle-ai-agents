"use server";

import { agents, db } from "@/drizzle";
import { openai } from "@ai-sdk/openai";
import { put } from "@vercel/blob";
import { type LanguageModelV1, streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { eq } from "drizzle-orm";
import { schema as artifactSchema } from "../artifact/schema";
import type { GeneratedObject } from "../artifact/types";
import type { GiselleNodeId } from "../giselle-node/types";
import type { Source } from "../source/types";
import { sourcesToText } from "../source/utils";
import type { AgentId } from "../types";
import { type V2FlowAction, setFlow, setStepOutput } from "./action";
import { type Flow, flowStatuses } from "./types";
import { buildFlow } from "./utils";

export async function executeFlow(
	agentId: AgentId,
	finalNodeId: GiselleNodeId,
) {
	const stream = createStreamableValue<V2FlowAction>();
	(async () => {
		const agent = await db.query.agents.findFirst({
			where: eq(agents.id, agentId),
		});
		if (agent === undefined) {
			throw new Error(`Agent with id ${agentId} not found`);
		}
		const graph = agent.graphv2;
		const flow = buildFlow({
			input: {
				agentId: graph.agentId,
				finalNodeId: finalNodeId,
				graph: graph,
			},
		});
		const flowBlob = await putFlow({ input: { flow } });
		stream.update(
			setFlow({
				input: {
					flow: {
						...flow,
						status: flowStatuses.queued,
						dataUrl: flowBlob.url,
					},
				},
			}),
		);
		for (const job of flow.jobs) {
			await Promise.all(
				job.steps.map(async (step) => {
					await generateText({
						input: {
							prompt: step.prompt,
							model: openai("gpt-4o-mini"),
							sources: [],
						},
						options: {
							onStreamPartialObject: (object) => {
								stream.update(
									setStepOutput({
										input: {
											stepId: step.id,
											output: object,
										},
									}),
								);
							},
						},
					});
				}),
			);
		}
		stream.done();
	})();

	return { streamableValue: stream.value };
}

interface GenerateTextInput {
	model: LanguageModelV1;
	prompt: string;
	sources: Source[];
}
interface GenerateTextOptions {
	onStreamPartialObject?: (partialObject: Partial<GeneratedObject>) => void;
}
async function generateText({
	input,
	options,
}: {
	input: GenerateTextInput;
	options: GenerateTextOptions;
}) {
	const system =
		input.sources.length > 0
			? `
 Your primary objective is to fulfill the user's request by utilizing the information provided within the <Source> or <WebPage> tags. Analyze the structured content carefully and leverage it to generate accurate and relevant responses. Focus on addressing the user's needs effectively while maintaining coherence and context throughout the interaction.

 If you use the information provided in the <WebPage>, After each piece of information, add a superscript number for citation (e.g. 1, 2, etc.).

 ${sourcesToText(input.sources)}

 `
			: "You generate an answer to a question. ";

	const { partialObjectStream, object } = await streamObject({
		model: input.model,
		system,
		prompt: input.prompt,
		schema: artifactSchema,
	});

	for await (const partialObject of partialObjectStream) {
		options.onStreamPartialObject?.({
			thinking: partialObject.thinking,
			artifact: {
				title: partialObject.artifact?.title || "",
				content: partialObject.artifact?.content || "",
				citations: (partialObject.artifact?.citations || [])?.map(
					(citation) => ({
						title: citation?.title ?? "",
						url: citation?.url ?? "",
					}),
				),
				completed: partialObject.artifact?.completed || false,
			},
			description: partialObject.description,
		});
	}
	return await object;
}

async function webSearch() {
	console.log("\x1b[33m\x1b[1mTODO:\x1b[0m Implement websearch functionality");
}

interface PutFlowInput {
	flow: Flow;
}
export async function putFlow({ input }: { input: PutFlowInput }) {
	const blob = await put(
		`/flows/${input.flow.id}/flow.json`,
		JSON.stringify(input.flow),
		{
			access: "public",
			contentType: "application/json",
		},
	);
	return blob;
}
