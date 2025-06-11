export * from "./types";
import type { CompletedGeneration } from "@giselle-sdk/data-type";
import type { TextGenerationLanguageModelData } from "@giselle-sdk/data-type";
import {
	GenerationContext,
	type ImageGenerationNode,
	type TextGenerationNode,
	isTextGenerationNode,
} from "@giselle-sdk/data-type";
import {
	Capability,
	calculateDisplayCost,
	hasCapability,
	languageModels,
} from "@giselle-sdk/language-model";
import { Langfuse } from "langfuse";
import type {
	AnthropicProviderOptions,
	TelemetrySettings,
	TelemetryTag,
	ToolSet,
} from "./types";

export interface GenerationCompleteOption {
	telemetry: TelemetrySettings["metadata"];
	providerOptions?: {
		anthropic?: AnthropicProviderOptions;
	};
}

interface LangfuseParams {
	traceParams: {
		userId?: string;
		name: string;
		input: string;
		tags: TelemetryTag[];
		metadata?: TelemetrySettings["metadata"];
		output?: string;
	};
	spanParams: {
		name: string;
		startTime: Date;
		input: string;
		endTime: Date;
		metadata?: TelemetrySettings["metadata"];
		output?: string;
	};
	generationParams: {
		name: string;
		model: string;
		modelParameters: Record<
			string,
			string | number | boolean | string[] | null
		>;
		input: string;
		usage: {
			input: number;
			output: number;
			total: number;
			unit: "TOKENS" | "IMAGES";
			inputCost?: number;
			outputCost?: number;
			totalCost?: number;
		};
		startTime: Date;
		completionStartTime: Date;
		endTime: Date;
		metadata?: TelemetrySettings["metadata"];
		output?: string;
	};
}

interface PromptJson {
	content?: Array<{
		content?: Array<{
			text?: string;
		}>;
	}>;
	text?: string;
}

export function generateTelemetryTags(args: {
	provider: string;
	modelId: string;
	toolSet: ToolSet;
	configurations: Record<string, unknown>;
	providerOptions?: {
		anthropic?: AnthropicProviderOptions;
	};
}): TelemetryTag[] {
	const tags: TelemetryTag[] = [];

	tags.push(args.provider, args.modelId);

	// OpenAI Web Search
	if (args.provider === "openai" && args.toolSet?.openaiWebSearch) {
		tags.push("web-search", "openai:web-search");
	}

	// Google Search Grounding
	if (args.provider === "google" && args.configurations?.searchGrounding) {
		tags.push("web-search", "google:search-grounding");
	}

	// Anthropic Reasoning/Thinking
	if (args.provider === "anthropic") {
		if (args.configurations?.reasoning) {
			tags.push("anthropic:reasoning");
		}
		if (args.providerOptions?.anthropic?.thinking?.type === "enabled") {
			// treat as an independent tag because extended thinking is available only on specific models
			// ref: https://docs.anthropic.com/en/docs/about-claude/models/all-models#model-comparison-table
			tags.push("anthropic:thinking");
		}
	}

	// Perplexity Search Domain Filter
	if (args.provider === "perplexity") {
		tags.push("web-search");

		if (
			Array.isArray(args.configurations?.searchDomainFilter) &&
			args.configurations?.searchDomainFilter.length > 0
		) {
			tags.push("perplexity:search-domain-filter");
		}
	}

	return tags;
}

function extractPromptInput(
	operationNode: TextGenerationNode | ImageGenerationNode,
): string {
	const promptJson = (() => {
		if (typeof operationNode.content.prompt === "string") {
			try {
				return JSON.parse(operationNode.content.prompt) as PromptJson;
			} catch (error) {
				console.warn("Failed to parse prompt JSON for telemetry:", error);
				return { content: [] };
			}
		}
		return { content: [] };
	})();

	if (promptJson.content?.[0]?.content?.[0]?.text) {
		return promptJson.content[0].content[0].text;
	}
	if (typeof promptJson.content === "string") {
		return promptJson.content;
	}
	return promptJson.text || "";
}

function extractInputOutputForTextGeneration(
	generation: CompletedGeneration,
	operationNode: TextGenerationNode,
) {
	const input = extractPromptInput(operationNode);
	const assistantMessage = generation.messages?.find(
		(msg) => msg.role === "assistant",
	);
	const output = assistantMessage?.content ?? "";

	return { input, output };
}

function extractInputForImageGeneration(
	generation: CompletedGeneration,
	operationNode: ImageGenerationNode,
) {
	const input = extractPromptInput(operationNode);

	// For image generation, we don't need output in telemetry
	return { input, output: undefined };
}

function extractToolSet(operationNode: TextGenerationNode): ToolSet {
	const toolSet: ToolSet = {};
	const tools = operationNode.content.tools as {
		openaiWebSearch?: boolean;
		github?: { tools: string[] };
		postgres?: { tools: string[] };
	};
	if (tools) {
		if (tools.openaiWebSearch) {
			toolSet.openaiWebSearch = true;
		}
		if (tools.github?.tools) {
			toolSet.github = tools.github.tools;
		}
		if (tools.postgres?.tools) {
			toolSet.postgres = tools.postgres.tools;
		}
	}
	return toolSet;
}

function getProviderOptions(
	provider: string,
	configurations: Record<string, unknown>,
	modelId: string,
): { anthropic?: AnthropicProviderOptions } {
	const providerOptions: { anthropic?: AnthropicProviderOptions } = {};
	const languageModel = languageModels.find((model) => model.id === modelId);

	if (
		languageModel &&
		provider === "anthropic" &&
		"reasoning" in configurations &&
		configurations.reasoning &&
		hasCapability(languageModel, Capability.Reasoning)
	) {
		providerOptions.anthropic = {
			thinking: {
				type: "enabled",
			},
		};
	}

	return providerOptions;
}

async function createLangfuseParams(
	generation: CompletedGeneration,
	options: GenerationCompleteOption,
	type: "text" | "image",
): Promise<LangfuseParams> {
	const operationNode = generation.context.operationNode;
	const llm = operationNode.content.llm as {
		provider: string;
		id: string;
		configurations?: Record<
			string,
			string | number | boolean | string[] | null
		>;
	};
	const { input, output } =
		type === "text"
			? extractInputOutputForTextGeneration(
					generation,
					operationNode as TextGenerationNode,
				)
			: extractInputForImageGeneration(
					generation,
					operationNode as ImageGenerationNode,
				);

	// Use the same metadata format for both text and image generation
	const enhancedMetadata = { ...options?.telemetry };
	const baseParams = {
		name: type === "text" ? "llm-generation" : "image-generation",
		input,
		output,
		metadata: enhancedMetadata,
	};

	const displayCost =
		type === "text"
			? await calculateDisplayCost(
					llm.provider,
					llm.id,
					generation.usage ?? {
						promptTokens: 0,
						completionTokens: 0,
						totalTokens: 0,
					},
				)
			: null;

	return {
		traceParams: {
			...(options?.telemetry?.userId && {
				userId: String(options.telemetry.userId),
			}),
			...baseParams,
			tags:
				type === "text"
					? generateTelemetryTags({
							provider: llm.provider,
							modelId: llm.id,
							toolSet: extractToolSet(operationNode as TextGenerationNode),
							configurations: llm.configurations ?? {},
							providerOptions: getProviderOptions(
								llm.provider,
								llm.configurations ?? {},
								llm.id,
							),
						})
					: [llm.provider, llm.id],
		},
		spanParams: {
			...baseParams,
			startTime: new Date(generation.queuedAt ?? generation.createdAt),
			endTime: new Date(generation.completedAt),
		},
		generationParams: {
			...baseParams,
			model: llm.id,
			modelParameters: llm.configurations ?? {},
			usage:
				type === "text"
					? {
							input: generation.usage?.promptTokens ?? 0,
							output: generation.usage?.completionTokens ?? 0,
							total: generation.usage?.totalTokens ?? 0,
							unit: "TOKENS",
							inputCost: displayCost?.inputCostForDisplay ?? 0,
							outputCost: displayCost?.outputCostForDisplay ?? 0,
							totalCost: displayCost?.totalCostForDisplay ?? 0,
						}
					: {
							input: 0,
							output: 0,
							total: 0,
							unit: "IMAGES",
						},
			startTime: new Date(generation.createdAt),
			completionStartTime: new Date(generation.startedAt),
			endTime: new Date(generation.completedAt),
		},
	};
}

export async function emitTelemetry(
	generation: CompletedGeneration,
	options: GenerationCompleteOption,
) {
	try {
		const langfuse = new Langfuse();

		if (!isTextGenerationNode(generation.context.operationNode)) {
			console.warn("Skipping telemetry for non-text generation");
			return;
		}

		const llm = generation.context.operationNode.content.llm;

		const promptJson = (() => {
			if (typeof generation.context.operationNode.content.prompt === "string") {
				try {
					return JSON.parse(generation.context.operationNode.content.prompt);
				} catch (error) {
					console.warn("Failed to parse prompt JSON for telemetry:", error);
					return { content: [] };
				}
			}
			return { content: [] };
		})();
		const input = (() => {
			// Handle various prompt formats more robustly
			if (promptJson.content?.[0]?.content?.[0]?.text) {
				return promptJson.content[0].content[0].text;
			}
			if (typeof promptJson.content === "string") {
				return promptJson.content;
			}
			return promptJson.text || "";
		})();

		const assistantMessage = generation.messages?.find(
			(msg) => msg.role === "assistant",
		);
		const output = assistantMessage?.content ?? "";

		const toolSet: ToolSet = {};
		const tools = generation.context.operationNode.content.tools;
		if (tools) {
			if (tools.openaiWebSearch) {
				toolSet.openaiWebSearch = true;
			}
			if (tools.github?.tools) {
				toolSet.github = tools.github.tools;
			}
			if (tools.postgres?.tools) {
				toolSet.postgres = tools.postgres.tools;
			}
		}

		const languageModel = languageModels.find((model) => model.id === llm.id);

		const providerOptions: { anthropic?: AnthropicProviderOptions } = {};
		if (
			languageModel &&
			llm.provider === "anthropic" &&
			llm.configurations?.reasoning &&
			hasCapability(languageModel, Capability.Reasoning)
		) {
			providerOptions.anthropic = {
				thinking: {
					type: "enabled",
				},
			};
		}

		const trace = langfuse.trace({
			name: "llm-generation",
			input,
			tags: generateTelemetryTags({
				provider: llm.provider,
				modelId: llm.id,
				toolSet,
				configurations: llm.configurations ?? {},
				providerOptions,
			}),
			metadata: options?.telemetry,
			output,
		});

		const span = trace.span({
			name: "llm-generation",
			startTime: new Date(generation.queuedAt ?? generation.createdAt),
			input,
			endTime: new Date(generation.completedAt),
			metadata: options?.telemetry,
			output,
		});

		const displayCost = await calculateDisplayCost(
			llm.provider,
			llm.id,
			generation.usage ?? {
				promptTokens: 0,
				completionTokens: 0,
				totalTokens: 0,
			},
		);

		span.generation({
			name: "llm-generation",
			model: llm.id,
			modelParameters: llm.configurations ?? {},
			input,
			usage: {
				input: generation.usage?.promptTokens ?? 0,
				output: generation.usage?.completionTokens ?? 0,
				total: generation.usage?.totalTokens ?? 0,
				inputCost: displayCost.inputCostForDisplay ?? 0,
				outputCost: displayCost.outputCostForDisplay ?? 0,
				totalCost: displayCost.totalCostForDisplay ?? 0,
				unit: "TOKENS",
			},
			startTime: new Date(generation.createdAt),
			completionStartTime: new Date(generation.startedAt),
			endTime: new Date(generation.completedAt),
			metadata: options?.telemetry,
			output,
		});

		await langfuse.flushAsync();
	} catch (error) {
		console.error("Telemetry emission failed:", error);
	}
}
