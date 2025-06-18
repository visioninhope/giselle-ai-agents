import { openai } from "@ai-sdk/openai";
import { embed, embedMany } from "ai";
import { z } from "zod/v4";
import { ConfigurationError, EmbeddingError } from "../errors";
import type { EmbedderFunction } from "./types";

const OpenAIEmbedderConfigSchema = z.object({
	apiKey: z
		.string()
		.min(1, "API key cannot be empty")
		.regex(/^sk-/, "API key must start with 'sk-'"),
	model: z
		.enum([
			"text-embedding-3-small",
			"text-embedding-3-large",
			"text-embedding-ada-002",
		])
		.optional()
		.default("text-embedding-3-small"),
	maxRetries: z
		.number()
		.int()
		.min(0, "Max retries must be non-negative")
		.max(10, "Max retries cannot exceed 10")
		.optional()
		.default(3),
});

export interface OpenAIEmbedderConfig {
	apiKey: string;
	model?: string;
	maxRetries?: number;
}

/**
 * Create an OpenAI embedder with the specified configuration
 * @param config Configuration for the OpenAI embedder
 * @returns An embedder object with embed and embedMany functions
 */
export function createOpenAIEmbedder(
	config: OpenAIEmbedderConfig,
): EmbedderFunction {
	// Validate configuration with Zod
	const validationResult = OpenAIEmbedderConfigSchema.safeParse(config);
	if (!validationResult.success) {
		throw ConfigurationError.invalidValue(
			"OpenAIEmbedderConfig",
			config,
			"Valid OpenAI embedder configuration",
			{
				operation: "createOpenAIEmbedder",
				validationErrors: validationResult.error.issues,
			},
		);
	}

	// Use validated and defaulted values
	const { apiKey, model, maxRetries } = validationResult.data;

	return {
		async embed(text: string): Promise<number[]> {
			try {
				const { embedding } = await embed({
					model: openai.embedding(model),
					maxRetries,
					value: text,
				});
				return embedding;
			} catch (error: unknown) {
				if (error instanceof Error) {
					throw EmbeddingError.apiError(error, {
						operation: "embed",
						model,
					});
				}
				throw EmbeddingError.apiError(new Error(String(error)), {
					operation: "embed",
					model,
				});
			}
		},

		async embedMany(texts: string[]): Promise<number[][]> {
			try {
				const { embeddings } = await embedMany({
					model: openai.embedding(model),
					maxRetries,
					values: texts,
				});
				return embeddings;
			} catch (error: unknown) {
				if (error instanceof Error) {
					throw EmbeddingError.apiError(error, {
						operation: "embedMany",
						model,
					});
				}
				throw EmbeddingError.apiError(new Error(String(error)), {
					operation: "embedMany",
					model,
				});
			}
		},
	};
}
