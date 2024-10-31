"use server";

import { agents, db } from "@/drizzle";
import { openai } from "@ai-sdk/openai";
import { put } from "@vercel/blob";
import { type LanguageModelV1, streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import { eq } from "drizzle-orm";
import { schema as artifactSchema } from "../artifact/schema";
import { giselleNodeArchetypes } from "../giselle-node/blueprints";
import {
	type GiselleNodeId,
	giselleNodeCategories,
} from "../giselle-node/types";
import type { Source } from "../source/types";
import { sourcesToText } from "../source/utils";
import type { AgentId } from "../types";
import { type V2FlowAction, addArtifact, replaceFlowAction } from "./action";
import { type Flow, type FlowAction, flowActionStatuses } from "./types";

interface RunActionInput {
	agentId: AgentId;
	nodeId: GiselleNodeId;
	action: FlowAction;
	stream: boolean;
}
export async function runAction(input: RunActionInput) {
	const stream = createStreamableValue<V2FlowAction>();
	(async () => {
		stream.update(
			replaceFlowAction({
				input: {
					...input.action,
					status: flowActionStatuses.running,
					output: "",
				},
			}),
		);
		const agent = await db.query.agents.findFirst({
			where: eq(agents.id, input.agentId),
		});
		if (agent === undefined) {
			throw new Error(`Agent with id ${input.agentId} not found`);
		}
		const graph = agent.graphv2;

		const instructionConnector = graph.connectors.find(
			(connector) =>
				connector.target === input.nodeId &&
				connector.sourceNodeCategory === giselleNodeCategories.instruction,
		);

		if (instructionConnector === undefined) {
			throw new Error(
				`No instruction connector found for node ${input.nodeId}`,
			);
		}

		const instructionNode = graph.nodes.find(
			(node) => node.id === instructionConnector.source,
		);
		const actionNode = graph.nodes.find(
			(node) => node.id === instructionConnector.target,
		);

		if (instructionNode === undefined || actionNode === undefined) {
			throw new Error(
				`Instruction node ${instructionConnector.source} or action node ${instructionConnector.target} not found`,
			);
		}

		const artifact = agent.graphv2.artifacts.find(
			(artifact) => artifact.generatorNode.id === actionNode.id,
		);
		if (artifact === undefined) {
			throw new Error(`No artifact found for node ${actionNode.id}`);
		}

		const sources: Source[] = [];
		switch (instructionConnector.targetNodeArcheType) {
			case giselleNodeArchetypes.textGenerator:
				{
					const result = await generateText({
						input: {
							action: input.action,
							prompt: instructionNode.output as string,
							sources,
							model: openai("gpt-4o"),
						},
						options: {
							onAction: (action) => {
								stream.update(action);
							},
						},
					});
					stream.update(
						replaceFlowAction({
							input: {
								...input.action,
								output: result,
								status: flowActionStatuses.completed,
							},
						}),
					);
					stream.update(
						addArtifact({
							input: {
								artifact: {
									...result.artifact,
									id: artifact.id,
									object: "artifact",
									generatorNode: {
										id: actionNode.id,
										category: actionNode.category,
										archetype: actionNode.archetype,
										name: actionNode.name,
										object: "node.artifactElement",
										properties: actionNode.properties,
									},
									elements: [],
								},
							},
						}),
					);
				}
				break;
			case giselleNodeArchetypes.webSearch:
				await webSearch();
				break;
		}
		stream.done();
	})();

	return {
		object: stream.value,
	};
}

interface GenerateTextInput {
	model: LanguageModelV1;
	prompt: string;
	action: FlowAction;
	sources: Source[];
}
interface GenerateTextOptions {
	onAction?: (action: V2FlowAction) => void;
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
		options.onAction?.(
			replaceFlowAction({
				input: {
					...input.action,
					status: flowActionStatuses.running,
					output: partialObject,
				},
			}),
		);
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
