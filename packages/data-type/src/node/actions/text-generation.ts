import { z } from "zod";
import { Anthropic, Google, LLM, OpenAI } from "../../llm";
import { InputPort, NodeBase, OutputPort } from "../base";

export const OpenAIContent = z.object({
	type: z.literal("textGeneration"),
	llm: OpenAI,
	prompt: z.string(),
});
export const GoogleGenerativeAIContent = z.object({
	type: z.literal("textGeneration"),
	llm: Google,
	prompt: z.string(),
});
export const AnthropicContent = z.object({
	type: z.literal("textGeneration"),
	llm: Anthropic,
	prompt: z.string(),
});

export const TextGenerationContent = z.object({
	type: z.literal("textGeneration"),
	llm: LLM,
	prompt: z.string().optional(),
});
export type TextGenerationContent = z.infer<typeof TextGenerationContent>;

export const TextGenerationNode = NodeBase.extend({
	type: z.literal("action"),
	content: TextGenerationContent,
});
type TextGenerationNode = z.infer<typeof TextGenerationNode>;

export function isTextGenerationNode(node?: {
	type: string;
	content: unknown;
}): node is { type: "action"; content: TextGenerationContent } {
	return (
		node?.type === "action" &&
		(node?.content as TextGenerationContent).type === "textGeneration"
	);
}
