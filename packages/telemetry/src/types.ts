import type { AnthropicProviderOptions } from "@ai-sdk/anthropic";
import type {
	CompletedGeneration,
	RunningGeneration,
} from "@giselle-sdk/data-type";
import type { TelemetrySettings as AI_TelemetrySettings } from "ai";
import type { ToolSet } from "ai";

export interface TelemetrySettings {
	metadata?: AI_TelemetrySettings["metadata"];
}

export type BaseFunctionalityTag = "web-search";

export type ProviderNameTag = "openai" | "anthropic" | "google" | "perplexity";

export type ProviderOptionTag =
	| "openai:web-search"
	| "google:search-grounding"
	| "anthropic:reasoning"
	| "anthropic:thinking"
	| "perplexity:search-domain-filter";

export type ModelNameTag = string;

export type TokenUsage = {
	promptTokens: number;
	completionTokens: number;
	totalTokens: number;
};

export type LLMUsage = unknown;

export type TelemetryTag =
	| BaseFunctionalityTag
	| ProviderNameTag
	| ProviderOptionTag
	| ModelNameTag;

export type LLMGeneration = {
	messages: unknown[];
	output: string;
	usage: LLMUsage;
};

export type LLMSpan = {
	name: string;
	startTime: Date;
	endTime: Date;
	attributes: Record<string, unknown>;
};

export type LLMTrace = {
	span: (args: {
		name: string;
		metadata?: Record<string, unknown>;
		startTime: Date;
		input: { messages: unknown[] };
		endTime: Date;
		output: string;
	}) => LLMSpan;
	generation: (args: {
		name: string;
		model: string;
		modelParameters: Record<string, unknown>;
		metadata?: Record<string, unknown>;
		input: { messages: unknown[] };
		startTime: Date;
		completionStartTime: Date;
		endTime: Date;
		output: string;
		usage: LLMUsage;
	}) => LLMGeneration;
};

export interface LLMTracer {
	createAndEmit: (args: {
		runningGeneration: RunningGeneration;
		completedGeneration: CompletedGeneration;
		tokenUsage: TokenUsage;
		provider: string;
		modelId: string;
		telemetry?: TelemetrySettings;
		messages: { messages: unknown[] };
		output: string;
		toolSet: ToolSet;
		configurations: Record<string, unknown>;
		providerOptions?: {
			anthropic?: AnthropicProviderOptions;
		};
		traceName: string;
		spanName: string;
		generationName: string;
	}) => Promise<void>;
}
