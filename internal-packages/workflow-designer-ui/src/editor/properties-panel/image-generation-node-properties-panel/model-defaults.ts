import {
	FalLanguageModelData,
	type ImageGenerationLanguageModelData,
	OpenAIImageLanguageModelData,
} from "@giselle-sdk/data-type";

type Provider = "fal" | "openai";

export function createDefaultModelData(
	provider: Provider,
): ImageGenerationLanguageModelData {
	switch (provider) {
		case "fal":
			return FalLanguageModelData.parse({
				provider: "fal",
				id: "fal-ai/flux/schnell",
				configurations: {
					size: "landscape_4_3",
					n: 1,
				},
			});
		case "openai":
			try {
				return OpenAIImageLanguageModelData.parse({
					provider: "openai",
					id: "gpt-image-1",
					configurations: {
						n: 1,
						size: "1024x1024",
						quality: "auto",
						moderation: "auto",
						background: "auto",
					},
				});
			} catch (error) {
				console.error("OpenAI model data parse error:", error);
				throw error;
			}
		default: {
			const _exhaustiveCheck: never = provider;
			throw new Error(`Unhandled provider: ${_exhaustiveCheck}`);
		}
	}
}

export function updateModelId(
	currentModel: ImageGenerationLanguageModelData,
	newModelId: string,
): ImageGenerationLanguageModelData {
	switch (currentModel.provider) {
		case "fal":
			return FalLanguageModelData.parse({
				...currentModel,
				id: newModelId,
			});
		case "openai":
			return OpenAIImageLanguageModelData.parse({
				...currentModel,
				id: newModelId,
			});
		default: {
			const _exhaustiveCheck: never = currentModel;
			throw new Error(
				`Unhandled provider: ${JSON.stringify(_exhaustiveCheck)}`,
			);
		}
	}
}
