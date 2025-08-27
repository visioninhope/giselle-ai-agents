import { createGoogleGenerativeAI } from "@ai-sdk/google";
import {
	type BaseEmbedderConfig,
	createAiSdkEmbedder,
} from "./ai-sdk-embedder";
import type { EmbedderFunction } from "./types";

export type GoogleEmbedderConfig = BaseEmbedderConfig;

/**
 * Create a Google embedder with the specified configuration
 * @param config Configuration for the Google embedder
 * @returns An embedder object with embed and embedMany functions
 */
export function createGoogleEmbedder(
	config: GoogleEmbedderConfig,
): EmbedderFunction {
	const google = createGoogleGenerativeAI({ apiKey: config.apiKey });

	return createAiSdkEmbedder(config, (modelName) =>
		google.textEmbeddingModel(modelName),
	);
}
