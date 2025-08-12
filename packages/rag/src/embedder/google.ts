import { google } from "@ai-sdk/google";
import type { TelemetrySettings } from "ai";
import { createAiSdkEmbedder } from "./ai-sdk-embedder";
import type { EmbedderFunction } from "./types";

type GeminiEmbeddingModel = "gemini-embedding-001";

export interface GoogleEmbedderConfig {
	apiKey: string;
	model?: GeminiEmbeddingModel;
	maxRetries?: number;
	telemetry?: TelemetrySettings;
}

/**
 * Create a Google embedder with the specified configuration
 * @param config Configuration for the Google embedder
 * @returns An embedder object with embed and embedMany functions
 */
export function createGoogleEmbedder(
	config: GoogleEmbedderConfig,
): EmbedderFunction {
	return createAiSdkEmbedder<GeminiEmbeddingModel>({
		config,
		defaultModel: "gemini-embedding-001",
		getModel: (modelName) => google.textEmbeddingModel(modelName),
	});
}
