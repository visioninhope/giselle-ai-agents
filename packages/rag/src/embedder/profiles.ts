import {
	type EmbeddingDimensions,
	type EmbeddingModelId,
	type EmbeddingProvider,
	ModelDimensions,
} from "@giselle-sdk/data-type";
import { createGoogleEmbedder } from "./google";
import { createOpenAIEmbedder } from "./openai";
import type { EmbedderFunction } from "./types";

type EmbeddingProfile = {
	provider: EmbeddingProvider;
	model: EmbeddingModelId;
	dimensions: EmbeddingDimensions;
	name: string;
};

export const EMBEDDING_PROFILES = {
	1: {
		provider: "openai" as const,
		model: "text-embedding-3-small" as const,
		dimensions: ModelDimensions["text-embedding-3-small"],
		name: "OpenAI text-embedding-3-small",
	},
	2: {
		provider: "openai" as const,
		model: "text-embedding-3-large" as const,
		dimensions: ModelDimensions["text-embedding-3-large"],
		name: "OpenAI text-embedding-3-large",
	},
	3: {
		provider: "google" as const,
		model: "gemini-embedding-001" as const,
		dimensions: ModelDimensions["gemini-embedding-001"],
		name: "Google gemini-embedding-001",
	},
} as const satisfies Record<number, EmbeddingProfile>;

export type EmbeddingProfileId = keyof typeof EMBEDDING_PROFILES;

export function createEmbedderFromProfile(
	profileId: EmbeddingProfileId,
	apiKey: string,
): EmbedderFunction {
	const profile = EMBEDDING_PROFILES[profileId];

	switch (profile.provider) {
		case "openai":
			return createOpenAIEmbedder({
				apiKey,
				model: profile.model,
			});
		case "google":
			return createGoogleEmbedder({
				apiKey,
				model: profile.model,
			});
		default: {
			const _exhaustiveCheck: never = profile;
			throw new Error(`Unknown provider: ${_exhaustiveCheck}`);
		}
	}
}
