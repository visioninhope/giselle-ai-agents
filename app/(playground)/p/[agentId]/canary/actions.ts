"use server";

import { toJsonSchema } from "@valibot/to-json-schema";
import { jsonSchema, streamObject } from "ai";
import { createStreamableValue } from "ai/rsc";
import HandleBars from "handlebars";
import * as v from "valibot";
import { textGenerationPrompt } from "./prompts";
import type {
	Graph,
	GraphId,
	NodeHandle,
	NodeHandleId,
	NodeId,
	TextArtifactObject,
	TextGenerateActionContent,
} from "./types";
import { resolveLanguageModel } from "./utils";

const artifactSchema = v.object({
	plan: v.pipe(
		v.string(),
		v.description(
			"How you think about the content of the artefact (purpose, structure, essentials) and how you intend to output it",
		),
	),
	title: v.pipe(v.string(), v.description("The title of the artefact")),
	content: v.pipe(
		v.string(),
		v.description("The content of the artefact formatted markdown."),
	),
	description: v.pipe(
		v.string(),
		v.description(
			"Explanation of the Artifact and what the intention was in creating this Artifact. Add any suggestions for making it even better.",
		),
	),
});

interface ActionSourceBase {
	type: string;
	nodeId: NodeId;
}

interface TextSource extends ActionSourceBase {
	type: "text";
	content: string;
}
interface TextGenerationSource extends ActionSourceBase {
	type: "textGeneration";
	title: string;
	content: string;
}

type ActionSource = TextSource | TextGenerationSource;

export async function action(graphUrl: string, nodeId: NodeId) {
	const graph = await fetch(graphUrl).then(
		(res) => res.json() as unknown as Graph,
	);
	const node = graph.nodes.find((node) => node.id === nodeId);
	if (node === undefined) {
		throw new Error("Node not found");
	}
	function findNode(handleId: NodeHandleId) {
		const connection = graph.connections.find(
			(connection) => connection.targetNodeHandleId === handleId,
		);
		const node = graph.nodes.find(
			(node) => node.id === connection?.sourceNodeId,
		);
		if (node === undefined) {
			return null;
		}
		return node;
	}
	function resolveSources(sources: NodeHandle[]) {
		return sources
			.map((source) => {
				const node = findNode(source.id);
				switch (node?.content.type) {
					case "text":
						return {
							type: "text",
							content: node.content.text,
							nodeId: node.id,
						} satisfies ActionSource;
					case "textGeneration": {
						const generatedArtifact = graph.artifacts.find(
							(artifact) => artifact.creatorNodeId === node.id,
						);
						if (
							generatedArtifact === undefined ||
							generatedArtifact.type === "generatedArtifact"
						) {
							return null;
						}
						return {
							type: "textGeneration",
							title: generatedArtifact.object.title,
							content: generatedArtifact.object.content,
							nodeId: node.id,
						} satisfies ActionSource;
					}
					default:
						return null;
				}
			})
			.filter((actionSource) => actionSource !== null);
	}
	function resolveRequirement(requirement?: NodeHandle) {
		if (requirement === undefined) {
			return null;
		}
		const node = findNode(requirement.id);
		switch (node?.content.type) {
			case "text":
				return node.content.text;
			case "textGeneration": {
				const generatedArtifact = graph.artifacts.find(
					(artifact) => artifact.creatorNodeId === node.id,
				);
				if (
					generatedArtifact === undefined ||
					generatedArtifact.type === "generatedArtifact"
				) {
					return null;
				}
				return generatedArtifact.object.content;
			}
			default:
				return null;
		}
	}

	switch (node.content.type) {
		case "textGeneration": {
			const actionSources = resolveSources(node.content.sources);
			const requirement = resolveRequirement(node.content.requirement);
			const model = resolveLanguageModel(node.content.llm);
			const promptTemplate = HandleBars.compile(textGenerationPrompt);
			const prompt = promptTemplate({
				instruction: node.content.instruction,
				requirement,
			});
			const topP = node.content.topP;
			const temperature = node.content.temperature;
			const stream = createStreamableValue<TextArtifactObject>();
			(async () => {
				const { partialObjectStream } = await streamObject({
					model,
					prompt,
					schema: jsonSchema<v.InferInput<typeof artifactSchema>>(
						toJsonSchema(artifactSchema),
					),
					topP,
					temperature,
				});

				for await (const partialObject of partialObjectStream) {
					stream.update({
						type: "text",
						title: partialObject.title ?? "",
						content: partialObject.content ?? "",
						messages: {
							plan: partialObject.plan ?? "",
							description: partialObject.description ?? "",
						},
					});
				}
				stream.done();
			})();
			return stream.value;
		}
		default:
			throw new Error("Invalid node type");
	}
}
