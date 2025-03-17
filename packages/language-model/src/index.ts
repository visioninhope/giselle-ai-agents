import { z } from "zod";
import {
	LanguageModel as AnthropicLanguageModel,
	models as anthropicLanguageModels,
} from "./anthropic";
import {
	LanguageModel as GoogleLanguageModel,
	models as googleLanguageModels,
} from "./google";
import {
	LanguageModel as OpenAILanguageModel,
	models as openaiLanguageModels,
} from "./openai";
import {
	LanguageModel as PerplexityLanguageModel,
	models as perplexityLanguageModels,
} from "./perplexity";
export * from "./base";
export * from "./helper";

export const LanguageModel = z.discriminatedUnion("provider", [
	AnthropicLanguageModel,
	GoogleLanguageModel,
	OpenAILanguageModel,
	PerplexityLanguageModel,
]);
export type LanguageModel = z.infer<typeof LanguageModel>;

export const languageModels = [
	...googleLanguageModels,
	...anthropicLanguageModels,
	...openaiLanguageModels,
	...perplexityLanguageModels,
];

export {
	AnthropicLanguageModel,
	GoogleLanguageModel,
	OpenAILanguageModel,
	PerplexityLanguageModel,
	anthropicLanguageModels,
	openaiLanguageModels,
	googleLanguageModels,
	perplexityLanguageModels,
};

export const LanguageModelProviders = z.enum([
	AnthropicLanguageModel.shape.provider.value,
	GoogleLanguageModel.shape.provider.value,
	OpenAILanguageModel.shape.provider.value,
	PerplexityLanguageModel.shape.provider.value,
]);
export type LanguageModelProvider = z.infer<typeof LanguageModelProviders>;
