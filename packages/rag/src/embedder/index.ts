export {
	createOpenAIEmbedder,
	type OpenAIEmbedderConfig,
} from "./openai";
export type { EmbedderFunction } from "./types";
import type { TelemetrySettings } from "ai";

import { createOpenAIEmbedder } from "./openai";

const DEFAULT_OPENAI_MODEL = "text-embedding-3-small";

/**
 * Create an OpenAI embedder with default configuration
 * @param experimental_telemetry Optional telemetry settings for AI SDK
 * @returns An embedder function using OpenAI's text-embedding-3-small model
 * @throws Error if OPENAI_API_KEY environment variable is not set
 */
export function createDefaultEmbedder(
	experimental_telemetry?: TelemetrySettings,
) {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) {
		throw new Error("OPENAI_API_KEY environment variable is required");
	}
	return createOpenAIEmbedder({
		apiKey,
		model: DEFAULT_OPENAI_MODEL,
		experimental_telemetry,
	});
}
