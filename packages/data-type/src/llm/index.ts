import { z } from "zod";

export const OpenAI = z.object({
	provider: z.literal("openai"),
	model: z.enum(["o1-preview", "o1-mini", "gpt-4o"]),
	temperature: z.number(),
	topP: z.number(),
	frequencyPenalty: z.number(),
	presencePenalty: z.number(),
});
export type OpenAI = z.infer<typeof OpenAI>;
export const OpenAIString =
	z.custom<`openai:${z.infer<typeof OpenAI>["model"]}`>((val) => {
		if (typeof val !== "string" || !val.startsWith("openai:")) {
			return false;
		}
		const [provider, model] = val.split(":");
		return OpenAI.safeParse({ provider, model }).success;
	});
export type OpenAIString = z.infer<typeof OpenAIString>;

export const AnthropicModelId = z.enum(["claude-3-5-sonnet-latest"]);
export type AnthropicModelId = z.infer<typeof AnthropicModelId>;
export const Anthropic = z.object({
	provider: z.literal("anthropic"),
	model: AnthropicModelId,
	temperature: z.number(),
	topP: z.number(),
});
export type Anthropic = z.infer<typeof Anthropic>;
export const AnthropicString =
	z.custom<`anthropic:${z.infer<typeof Anthropic>["model"]}`>((val) => {
		if (typeof val !== "string" || !val.startsWith("anthropic:")) {
			return false;
		}
		const [provider, model] = val.split(":");
		return Anthropic.safeParse({ provider, model }).success;
	});
export type AnthropicString = z.infer<typeof AnthropicString>;

export const GoogleGenerativeAIModelId = z.enum([
	"gemini-2.0-pro-exp-02-05",
	"gemini-2.0-flash-thinking-exp-01-21",
	"gemini-2.0-flash-exp",
	"gemini-1.5-pro-latest",
	"gemini-1.5-flash-latest",
	"gemini-1.5-flash-8b-latest",
]);
export type GoogleGenerativeAIModelId = z.infer<
	typeof GoogleGenerativeAIModelId
>;

export const Google = z.object({
	provider: z.literal("google"),
	model: GoogleGenerativeAIModelId,
	temperature: z.number(),
	topP: z.number(),
	searchGrounding: z.boolean(),
});
export type Google = z.infer<typeof Google>;
export const GoogleString =
	z.custom<`google:${z.infer<typeof Google>["model"]}`>((val) => {
		if (typeof val !== "string" || !val.startsWith("google:")) {
			return false;
		}
		const [provider, model] = val.split(":");
		return Google.safeParse({ provider, model }).success;
	});
export type GoogleString = z.infer<typeof GoogleString>;

export const LLM = z.preprocess(
	(args: unknown) => {
		const result = LLMString.safeParse(args);
		if (!result.success) {
			return args;
		}
		const [provider, model] = result.data.split(":");
		return {
			provider,
			model,
		};
	},
	z.discriminatedUnion("provider", [OpenAI, Anthropic, Google]),
);
export type LLM = z.infer<typeof LLM>;

export const LLMString = z.preprocess(
	(args: unknown) => {
		if (typeof args !== "object" || args === null || args instanceof Map) {
			return args;
		}
		if (!("provider" in args && "model" in args)) {
			return args;
		}
		return `${args.provider}:${args.model}`;
	},
	z.union([OpenAIString, AnthropicString, GoogleString]),
);
export type LLMString = z.infer<typeof LLMString>;

export const LLMProvider = z.union([
	OpenAI.shape.provider,
	Anthropic.shape.provider,
	Google.shape.provider,
]);
export type LLMProvider = z.infer<typeof LLMProvider>;
