import { type EmbeddingModel, embed, embedMany } from "ai";
import { ConfigurationError, EmbeddingError } from "../errors";
import type { EmbedderFunction } from "./types";

export interface BaseEmbedderConfig {
	apiKey: string;
	model?: string;
	maxRetries?: number;
}

export function createAiSdkEmbedder(
	config: BaseEmbedderConfig,
	defaultModel: string,
	getModel: (modelName: string) => EmbeddingModel<string>,
): EmbedderFunction {
	if (!config.apiKey || config.apiKey.length === 0) {
		throw ConfigurationError.missingField("apiKey");
	}

	const model = config.model ?? defaultModel;
	const maxRetries = config.maxRetries ?? 3;

	return {
		async embed(text: string): Promise<number[]> {
			try {
				const { embedding } = await embed({
					model: getModel(model),
					maxRetries,
					value: text,
				});
				return embedding;
			} catch (error: unknown) {
				throw EmbeddingError.apiError(
					error instanceof Error ? error : new Error(String(error)),
					{ operation: "embed", model },
				);
			}
		},

		async embedMany(texts: string[]): Promise<number[][]> {
			try {
				const { embeddings } = await embedMany({
					model: getModel(model),
					maxRetries,
					values: texts,
				});
				return embeddings;
			} catch (error: unknown) {
				throw EmbeddingError.apiError(
					error instanceof Error ? error : new Error(String(error)),
					{ operation: "embedMany", model },
				);
			}
		},
	};
}
