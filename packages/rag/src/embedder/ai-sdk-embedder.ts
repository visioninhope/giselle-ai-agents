import type { EmbeddingProfile } from "@giselle-sdk/data-type";
import { type EmbeddingModel, embed, embedMany } from "ai";
import { ConfigurationError, EmbeddingError } from "../errors";
import type { EmbedderFunction, EmbeddingCompleteCallback } from "./types";

export interface EmbedderConfig {
	apiKey: string;
	profile: EmbeddingProfile;
	maxRetries?: number;
	embeddingComplete?: EmbeddingCompleteCallback;
}

export function createAiSdkEmbedder(
	config: EmbedderConfig,
	getModel: (modelName: string) => EmbeddingModel<string>,
): EmbedderFunction {
	if (!config.apiKey || config.apiKey.length === 0) {
		throw ConfigurationError.missingField("apiKey");
	}

	const { model, provider, dimensions } = config.profile;
	const maxRetries = config.maxRetries ?? 3;
	const normalizeUsage = (
		rawUsage: unknown,
	): { tokens: number; imageTokens?: number } | undefined => {
		if (!rawUsage || typeof rawUsage !== "object") {
			return undefined;
		}
		const usageWithTokens = rawUsage as { tokens?: unknown };
		if (typeof usageWithTokens.tokens !== "number") {
			return undefined;
		}
		const normalized: { tokens: number; imageTokens?: number } = {
			tokens: usageWithTokens.tokens,
		};
		const usageWithImages = rawUsage as { imageTokens?: unknown };
		if (typeof usageWithImages.imageTokens === "number") {
			normalized.imageTokens = usageWithImages.imageTokens;
		}
		return normalized;
	};

	return {
		async embed(text: string): Promise<number[]> {
			try {
				const startTime = new Date();
				const result = await embed({
					model: getModel(model),
					maxRetries,
					value: text,
				});

				if (config.embeddingComplete) {
					try {
						const usage = normalizeUsage(result.usage);
						await config.embeddingComplete({
							texts: [text],
							embeddings: [result.embedding],
							model,
							provider,
							dimensions,
							usage,
							operation: "embed",
							startTime,
							endTime: new Date(),
						});
					} catch (error) {
						console.error("Embedding callback error:", error);
					}
				}

				return result.embedding;
			} catch (error: unknown) {
				throw EmbeddingError.apiError(
					error instanceof Error ? error : new Error(String(error)),
					{ operation: "embed", model },
				);
			}
		},

		async embedMany(texts: string[]): Promise<number[][]> {
			try {
				const startTime = new Date();
				const result = await embedMany({
					model: getModel(model),
					maxRetries,
					values: texts,
				});

				if (config.embeddingComplete) {
					try {
						const usage = normalizeUsage(result.usage);
						await config.embeddingComplete({
							texts,
							embeddings: result.embeddings,
							model,
							provider,
							dimensions,
							usage,
							operation: "embedMany",
							startTime,
							endTime: new Date(),
						});
					} catch (error) {
						console.error("Embedding callback error:", error);
					}
				}

				return result.embeddings;
			} catch (error: unknown) {
				throw EmbeddingError.apiError(
					error instanceof Error ? error : new Error(String(error)),
					{ operation: "embedMany", model },
				);
			}
		},
		embeddingComplete: config.embeddingComplete,
	};
}
