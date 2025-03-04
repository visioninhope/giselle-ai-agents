import { z } from "zod";

export const OpenAIModelIds = z.enum([
	"o1-preview",
	"o1-mini",
	"gpt-4o",
	"gpt-4o-mini",
	"o3mini",
]);
export type OpenAIModelId = z.infer<typeof OpenAIModelIds>;
export const OpenAI = z.object({
	provider: z.literal("openai"),
	model: OpenAIModelIds,
	temperature: z.number(),
	topP: z.number(),
	frequencyPenalty: z.number(),
	presencePenalty: z.number(),
});
export type OpenAI = z.infer<typeof OpenAI>;

export const AnthropicModelId = z.enum(["claude-3-5-sonnet-latest"]);
export type AnthropicModelId = z.infer<typeof AnthropicModelId>;
export const Anthropic = z.object({
	provider: z.literal("anthropic"),
	model: AnthropicModelId,
	temperature: z.number(),
	topP: z.number(),
});
export type Anthropic = z.infer<typeof Anthropic>;

export const GoogleModelId = z.enum([
	"gemini-2.0-pro-exp-02-05",
	"gemini-2.0-flash-thinking-exp-01-21",
	"gemini-2.0-flash-exp",
	"gemini-1.5-pro-latest",
	"gemini-1.5-flash-latest",
	"gemini-1.5-flash-8b-latest",
]);
export type GoogleModelId = z.infer<typeof GoogleModelId>;

export const Google = z.object({
	provider: z.literal("google"),
	model: GoogleModelId,
	temperature: z.number(),
	topP: z.number(),
	searchGrounding: z.boolean(),
});
export type Google = z.infer<typeof Google>;

export const LLM = z.discriminatedUnion("provider", [
	OpenAI,
	Anthropic,
	Google,
]);
export type LLM = z.infer<typeof LLM>;

export const LLMProvider = z.union([
	OpenAI.shape.provider,
	Anthropic.shape.provider,
	Google.shape.provider,
]);
export type LLMProvider = z.infer<typeof LLMProvider>;
