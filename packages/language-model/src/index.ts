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
export * from "./base";
export * from "./helper";

export const LanguageModel = z.discriminatedUnion("provider", [
	AnthropicLanguageModel,
	GoogleLanguageModel,
	OpenAILanguageModel,
]);
export type LanguageModel = z.infer<typeof LanguageModel>;

export const languageModels = [
	...googleLanguageModels,
	...anthropicLanguageModels,
	...openaiLanguageModels,
];

export {
	AnthropicLanguageModel,
	GoogleLanguageModel,
	OpenAILanguageModel,
	anthropicLanguageModels,
	openaiLanguageModels,
	googleLanguageModels,
};
