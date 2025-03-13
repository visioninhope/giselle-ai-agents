import { LanguageModel } from "@giselle-sdk/language-model";
import { z } from "zod";

export const TextGenerationContent = z.object({
	type: z.literal("textGeneration"),
	llm: LanguageModel,
	prompt: z.string().optional(),
});
export type TextGenerationContent = z.infer<typeof TextGenerationContent>;


export const TextGenerationContentReference = z.object({
	type: TextGenerationContent.shape.type,
});
export type TextGenerationContentReference = z.infer<
	typeof TextGenerationContentReference
>;
