import {
	type EmbeddingModel,
	embed,
	embedMany,
	type TelemetrySettings,
} from "ai";
import { EmbeddingError } from "../errors";
import type { EmbedderFunction } from "./types";

interface BaseEmbedderConfig<TModelName extends string> {
	apiKey: string;
	model?: TModelName;
	maxRetries?: number;
	telemetry?: TelemetrySettings;
}

export function createAiSdkEmbedder<TModelName extends string>(params: {
	config: BaseEmbedderConfig<TModelName>;
	defaultModel: TModelName;
	getModel: (modelName: TModelName) => EmbeddingModel<string>;
}): EmbedderFunction {
	const { config, defaultModel, getModel } = params;

	if (!config.apiKey || config.apiKey.length === 0) {
		throw new Error("API key is required and cannot be empty");
	}

	const model = (config.model ?? defaultModel) as TModelName;
	const maxRetries = config.maxRetries ?? 3;
	const telemetry = config.telemetry;

	if (config.maxRetries !== undefined && (maxRetries < 0 || maxRetries > 10)) {
		throw new Error("maxRetries must be between 0 and 10");
	}

	return {
		async embed(text: string): Promise<number[]> {
			try {
				const { embedding } = await embed({
					model: getModel(model),
					maxRetries,
					value: text,
					experimental_telemetry: telemetry,
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
					model: getModel(model),
					maxRetries,
					values: texts,
					experimental_telemetry: telemetry,
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
