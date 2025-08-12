import { openai } from "@ai-sdk/openai";
import type { TelemetrySettings } from "ai";
import { createAiSdkEmbedder } from "./ai-sdk-embedder";
import type { EmbedderFunction } from "./types";

type OpenAIEmbeddingModel = "text-embedding-3-small" | "text-embedding-3-large";

export interface OpenAIEmbedderConfig {
	apiKey: string;
	model?: OpenAIEmbeddingModel;
	maxRetries?: number;
	telemetry?: TelemetrySettings;
}

/**
 * Create an OpenAI embedder with the specified configuration
 * @param config Configuration for the OpenAI embedder
 * @returns An embedder object with embed and embedMany functions
 */
export function createOpenAIEmbedder(
	config: OpenAIEmbedderConfig,
): EmbedderFunction {
	return createAiSdkEmbedder<OpenAIEmbeddingModel>({
		config,
		defaultModel: "text-embedding-3-small",
		getModel: (modelName) => openai.embedding(modelName),
	});
}
