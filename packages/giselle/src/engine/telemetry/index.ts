export * from "./types";

import {
	type ImageGenerationNode,
	isActionNode,
	isImageGenerationNode,
	isQueryNode,
	isTextGenerationNode,
	type TextGenerationNode,
} from "@giselle-sdk/data-type";
import { calculateDisplayCost } from "@giselle-sdk/language-model";
import type { DataContent } from "ai";
import { type ApiMediaContentType, Langfuse, LangfuseMedia } from "langfuse";
import type { GenerationCompleteCallbackFunctionArgs } from "../types";
import type { TelemetrySettings } from "./types";

export interface GenerationCompleteOption {
	telemetry?: TelemetrySettings;
}

async function dataContentToBuffer(dataContent: DataContent | URL) {
	if (typeof dataContent === "string") {
		return Buffer.from(dataContent);
	}
	if (Buffer.isBuffer(dataContent)) {
		return dataContent;
	}
	if (dataContent instanceof URL) {
		const res = await fetch(dataContent);
		const arrayBuffer = await res.arrayBuffer();
		return Buffer.from(arrayBuffer);
	}
	if (dataContent instanceof Uint8Array) {
		return Buffer.from(dataContent);
	}
	return Buffer.from(dataContent);
}

export async function emitTelemetry(
	args: GenerationCompleteCallbackFunctionArgs,
	options: GenerationCompleteOption,
) {
	try {
		const operationNode = args.generation.context.operationNode;
		const nodeType = operationNode.content.type;

		if (isQueryNode(operationNode)) {
			return;
		}
		if (isActionNode(operationNode)) {
			return;
		}

		if (
			operationNode.content.type !== "textGeneration" &&
			operationNode.content.type !== "imageGeneration"
		) {
			throw new Error(`Unsupported generation type: ${nodeType}`);
		}

		const langfuseInput = await Promise.all(
			args.inputMessages.map(async (inputMessage) => {
				if (!Array.isArray(inputMessage.content)) {
					return inputMessage.content;
				}
				return await Promise.all(
					inputMessage.content.map(async (content) => {
						switch (content.type) {
							case "text":
							case "reasoning":
							case "tool-call":
							case "tool-result":
								return content;
							case "file":
								return {
									...content,
									data: new LangfuseMedia({
										contentType: content.mediaType as ApiMediaContentType,
										contentBytes: await dataContentToBuffer(content.data),
									}),
								};
							case "image":
								return {
									...content,
									data: new LangfuseMedia({
										contentType: content.mediaType as ApiMediaContentType,
										contentBytes: await dataContentToBuffer(content.image),
									}),
								};
							default: {
								const _exhaustiveCheck: never = content;
								throw new Error(`Unhandled content type: ${_exhaustiveCheck}`);
							}
						}
					}),
				);
			}),
		);

		const langfuse = new Langfuse();
		const trace = langfuse.trace({
			name: "generation",
			userId: options.telemetry?.metadata?.userId
				? String(options.telemetry.metadata.userId)
				: undefined,
			input: langfuseInput,
		});
		if (isTextGenerationNode(operationNode)) {
			const cost = await calculateDisplayCost(
				operationNode.content.llm.provider,
				operationNode.content.llm.id,
				{
					inputTokens: args.generation.usage?.inputTokens ?? 0,
					outputTokens: args.generation.usage?.outputTokens ?? 0,
				},
			);
			trace.update({
				output: args.generation.outputs,
				tags: tags(operationNode),
				metadata: {
					...options.telemetry?.metadata,
					...metadata(operationNode),
				},
			});
			trace.generation({
				name: "generateText",
				model: operationNode.content.llm.id,
				modelParameters: operationNode.content.llm.configurations,
				input: langfuseInput,
				output: args.generation.outputs,
				usage: {
					unit: "TOKENS",
					input: args.generation.usage?.inputTokens ?? 0,
					output: args.generation.usage?.outputTokens ?? 0,
					total: args.generation.usage?.totalTokens ?? 0,
					inputCost: cost.inputCostForDisplay,
					outputCost: cost.outputCostForDisplay,
					totalCost: cost.totalCostForDisplay,
				},
				startTime: new Date(args.generation.startedAt),
				endTime: new Date(args.generation.completedAt),
				metadata: {
					...options.telemetry?.metadata,
					...metadata(operationNode),
				},
			});
		}
		if (isImageGenerationNode(operationNode)) {
			const langfuseMediaReferences = args.outputFiles.map(
				(outputFile) =>
					new LangfuseMedia({
						contentType: outputFile.contentType as ApiMediaContentType,
						contentBytes: Buffer.from(outputFile.data),
					}),
			);
			if (langfuseMediaReferences.length > 0) {
				trace.update({
					output: langfuseMediaReferences,
					tags: tags(operationNode),
					metadata: {
						...options.telemetry?.metadata,
						...metadata(operationNode),
					},
				});
				trace.generation({
					name: "generateImage",
					input: langfuseInput,
					output: langfuseMediaReferences,
					usage: {
						input: 0,
						output: 0,
						total: 0,
						unit: "IMAGES",
					},
					metadata: {
						...options.telemetry?.metadata,
						...metadata(operationNode),
					},
				});
			}
		}

		await langfuse.flushAsync();
	} catch (error) {
		console.error("Telemetry emission failed:", error);
	}
}

function tags({ content }: TextGenerationNode | ImageGenerationNode) {
	const tags: string[] = [`provider:${content.llm.provider}`];
	switch (content.type) {
		case "imageGeneration":
			break;
		case "textGeneration":
			switch (content.llm.provider) {
				case "anthropic":
					if (content.llm.configurations.reasoningText) {
						tags.push("feature:thinking");
					}
					break;
				case "google":
					if (content.llm.configurations.searchGrounding) {
						tags.push("tool:web-search");
					}
					break;
				case "openai":
					if (content.tools?.openaiWebSearch) {
						tags.push("tool:web-search");
					}
					break;
				case "perplexity":
					tags.push("tool:web-search");
					break;
				default: {
					const _exhaustiveCheck: never = content.llm;
					return _exhaustiveCheck;
				}
			}
			if (content.tools?.github) {
				tags.push("tool:github");
			}
			if (content.tools?.postgres) {
				tags.push("tool:postgres");
			}
			break;
		default: {
			const _exhaustiveCheck: never = content;
			throw new Error(`Unhandled type: ${_exhaustiveCheck}`);
		}
	}
	return tags;
}

function metadata({ content }: TextGenerationNode | ImageGenerationNode) {
	const metadata: Record<string, unknown> = {};
	switch (content.type) {
		case "imageGeneration":
			break;
		case "textGeneration":
			switch (content.llm.provider) {
				case "anthropic":
					if (content.llm.configurations.reasoningText) {
						metadata["tools.thinking.provider"] = "anthropic.thinking";
					}
					break;
				case "google":
					if (content.llm.configurations.searchGrounding) {
						metadata["tools.webSearch.provider"] = "google.googleSearch";
					}
					break;
				case "openai":
					if (content.tools?.openaiWebSearch) {
						metadata["tools.webSearch.provider"] = "openai.webSearchPreview";
					}
					break;
				case "perplexity":
					metadata["tools.webSearch.provider"] = "perplexity";
					break;
				default: {
					const _exhaustiveCheck: never = content.llm;
					return _exhaustiveCheck;
				}
			}
			if (content.tools?.github) {
				metadata["tools.github.tools"] = content.tools.github.tools;
			}
			break;
		default: {
			const _exhaustiveCheck: never = content;
			throw new Error(`Unhandled type: ${_exhaustiveCheck}`);
		}
	}
	return metadata;
}
