import {
	AnthropicLanguageModel,
	GoogleLanguageModel,
	OpenAILanguageModel,
} from "@giselle-sdk/language-model";
import { z } from "zod";

export const LanguageModelData = z.discriminatedUnion("provider", [
	AnthropicLanguageModel.pick({
		provider: true,
		id: true,
		configurations: true,
	}),
	GoogleLanguageModel.pick({
		provider: true,
		id: true,
		configurations: true,
	}),
	OpenAILanguageModel.pick({
		provider: true,
		id: true,
		configurations: true,
	}),
]);
export const TextGenerationContent = z.object({
	type: z.literal("textGeneration"),
	llm: LanguageModelData,
	prompt: z.string().optional(),
});
export type TextGenerationContent = z.infer<typeof TextGenerationContent>;

export const OverrideTextGenerationContent = z.object({
	type: z.literal("textGeneration"),
	prompt: z.string(),
});
export type OverrideTextGenerationContent = z.infer<
	typeof OverrideTextGenerationContent
>;

export function isOverrideTextGenerationContent(
	content: unknown,
): content is OverrideTextGenerationContent {
	return OverrideTextGenerationContent.safeParse(content).success;
}

export const TextGenerationContentReference = z.object({
	type: TextGenerationContent.shape.type,
});
export type TextGenerationContentReference = z.infer<
	typeof TextGenerationContentReference
>;
