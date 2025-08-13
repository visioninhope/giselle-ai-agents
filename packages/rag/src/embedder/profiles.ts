import type {
	EmbeddingDimensions,
	EmbeddingProvider,
} from "@giselle-sdk/data-type";
import { createGoogleEmbedder } from "./google";
import { createOpenAIEmbedder } from "./openai";
import type { EmbedderFunction } from "./types";

export type EmbeddingProfileId = 1 | 2 | 3;

export type EmbeddingProfile = {
	provider: EmbeddingProvider;
	model: string;
	dimensions: EmbeddingDimensions;
	name: string;
};

export const EMBEDDING_PROFILES: Record<EmbeddingProfileId, EmbeddingProfile> =
	{
		1: {
			provider: "openai",
			model: "text-embedding-3-small",
			dimensions: 1536,
			name: "OpenAI text-embedding-3-small",
		},
		2: {
			provider: "openai",
			model: "text-embedding-3-large",
			dimensions: 3072,
			name: "OpenAI text-embedding-3-large",
		},
		3: {
			provider: "google",
			model: "gemini-embedding-001",
			dimensions: 3072,
			name: "Google gemini-embedding-001",
		},
	} as const;

export function getEmbeddingProfile(
	profileId: EmbeddingProfileId,
): EmbeddingProfile {
	const profile = EMBEDDING_PROFILES[profileId];
	if (!profile) {
		throw new Error(`Unknown embedding profile ID: ${profileId}`);
	}
	return profile;
}

export function createEmbedderFromProfile(
	profileId: EmbeddingProfileId,
	apiKeys: {
		openai?: string;
		google?: string;
	},
): EmbedderFunction {
	const profile = getEmbeddingProfile(profileId);

	switch (profile.provider) {
		case "openai": {
			if (!apiKeys.openai) {
				throw new Error("OpenAI API key is required for OpenAI embeddings");
			}
			return createOpenAIEmbedder({
				apiKey: apiKeys.openai,
				model: profile.model as
					| "text-embedding-3-small"
					| "text-embedding-3-large",
			});
		}
		case "google": {
			if (!apiKeys.google) {
				throw new Error("Google API key is required for Google embeddings");
			}
			return createGoogleEmbedder({
				apiKey: apiKeys.google,
				model: "gemini-embedding-001",
			});
		}
		default:
			throw new Error(`Unsupported embedding provider: ${profile.provider}`);
	}
}
