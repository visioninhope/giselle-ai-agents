import { createOpenAI } from "@ai-sdk/openai";
import {
	type BaseEmbedderConfig,
	createAiSdkEmbedder,
} from "./ai-sdk-embedder";
import type { EmbedderFunction } from "./types";

export type OpenAIEmbedderConfig = BaseEmbedderConfig & {
	model?: "text-embedding-3-small" | "text-embedding-3-large";
};

/**
 * Create an OpenAI embedder with the specified configuration
 * @param config Configuration for the OpenAI embedder
 * @returns An embedder object with embed and embedMany functions
 */
export function createOpenAIEmbedder(
	config: OpenAIEmbedderConfig,
): EmbedderFunction {
	const openai = createOpenAI({ apiKey: config.apiKey });
	return createAiSdkEmbedder(config, "text-embedding-3-small", (modelName) =>
		openai.embedding(modelName),
	);
}
