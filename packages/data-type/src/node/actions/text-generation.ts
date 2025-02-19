import { z } from "zod";
import { Anthropic, Google, LLM, OpenAI } from "../../llm";
import { ConnectionHandle, NodeBase, NodeId } from "../base";

export const OpenAIContent = z.object({
	type: z.literal("textGeneration"),
	llm: OpenAI,
	prompt: z.string(),
	inputs: z.array(ConnectionHandle),
});
export const GoogleGenerativeAIContent = z.object({
	type: z.literal("textGeneration"),
	llm: Google,
	prompt: z.string(),
	inputs: z.array(ConnectionHandle),
});
export const AnthropicContent = z.object({
	type: z.literal("textGeneration"),
	llm: Anthropic,
	prompt: z.string(),
	inputs: z.array(ConnectionHandle),
});

export const TextGenerationContent = z.object({
	type: z.literal("textGeneration"),
	llm: LLM,
	prompt: z.string().optional(),
	inputs: z.array(ConnectionHandle),
});
export type TextGenerationContent = z.infer<typeof TextGenerationContent>;

export const TextGenerationNode = NodeBase.extend({
	type: z.literal("action"),
	content: TextGenerationContent,
});
type TextGenerationNode = z.infer<typeof TextGenerationNode>;

export const CreateTextGenerationNodeParams =
	TextGenerationContent.partial().extend({
		name: z.string().optional(),
	});
export type CreateTextGenerationNodeParams = z.infer<
	typeof CreateTextGenerationNodeParams
>;

export function isTextGenerationNode(node?: {
	type: string;
	content: unknown;
}): node is { type: "action"; content: TextGenerationContent } {
	return (
		node?.type === "action" &&
		(node?.content as TextGenerationContent).type === "textGeneration"
	);
}

export function createTextGenerationNode(
	params: z.infer<typeof CreateTextGenerationNodeParams>,
): z.infer<typeof TextGenerationNode> {
	return {
		id: NodeId.generate(),
		name: params.name,
		type: "action",
		content: {
			type: "textGeneration",
			llm: params.llm ?? {
				provider: "openai",
				model: "gpt-4o",
				temperature: 1.0,
				topP: 1.0,
				presencePenalty: 0.0,
				frequencyPenalty: 0.0,
			},
			prompt: params.prompt,
			inputs: params.inputs ?? [],
		},
	};
}
