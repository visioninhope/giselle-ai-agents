export * from "./types";
import type { CompletedGeneration } from "@giselle-sdk/data-type";
import type { TextGenerationLanguageModelData } from "@giselle-sdk/data-type";
import {
	GenerationContext,
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

		const promptJson =
			typeof generation.context.operationNode.content.prompt === "string"
				? JSON.parse(generation.context.operationNode.content.prompt)
				: { content: [] };
		const input = promptJson.content?.[0]?.content?.[0]?.text ?? "";
		const output =
			generation.messages.find((msg) => msg.role === "assistant")?.content ??
			"";

		const toolSet: ToolSet = {};
		if (
			llm.provider === "openai" &&
			generation.context.operationNode.content.tools?.openaiWebSearch
		) {
			toolSet.openaiWebSearch = true;
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
