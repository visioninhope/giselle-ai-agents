import {
	AnthropicLanguageModelData,
	GoogleLanguageModelData,
	OpenAILanguageModelData,
	PerplexityLanguageModelData,
	type TextGenerationLanguageModelData,
} from "@giselle-sdk/data-type";

type Provider = "openai" | "anthropic" | "google" | "perplexity";

export function createDefaultModelData(
	provider: Provider,
): TextGenerationLanguageModelData {
	switch (provider) {
		case "openai":
			return OpenAILanguageModelData.parse({
				provider: "openai",
				id: "gpt-4o",
				configurations: {
					temperature: 0.7,
					topP: 1.0,
					frequencyPenalty: 0.0,
					presencePenalty: 0.0,
				},
			});
		case "anthropic":
			return AnthropicLanguageModelData.parse({
				provider: "anthropic",
				id: "claude-3-5-haiku-20241022",
				configurations: {
					temperature: 0.7,
					topP: 1.0,
					topK: 40,
				},
			});
		case "google":
			return GoogleLanguageModelData.parse({
				provider: "google",
				id: "gemini-2.5-flash-lite",
				configurations: {
					temperature: 0.7,
					topP: 1.0,
					topK: 40,
					searchGrounding: false,
				},
			});
		case "perplexity":
			return PerplexityLanguageModelData.parse({
				provider: "perplexity",
				id: "llama-3.1-sonar-large-128k-online",
				configurations: {
					temperature: 0.7,
					topP: 1.0,
				},
			});
		default: {
			const _exhaustiveCheck: never = provider;
			throw new Error(`Unhandled provider: ${_exhaustiveCheck}`);
		}
	}
}

export function updateModelId(
	currentModel: TextGenerationLanguageModelData,
	newModelId: string,
): TextGenerationLanguageModelData {
	switch (currentModel.provider) {
		case "openai":
			return OpenAILanguageModelData.parse({
				...currentModel,
				id: newModelId,
			});
		case "anthropic":
			return AnthropicLanguageModelData.parse({
				...currentModel,
				id: newModelId,
			});
		case "google":
			return GoogleLanguageModelData.parse({
				...currentModel,
				id: newModelId,
			});
		case "perplexity":
			return PerplexityLanguageModelData.parse({
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
