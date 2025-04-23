import { z } from "zod";

export const GitHubTriggerProvider = z.object({
	type: z.literal("github"),
});
export type GitHubTriggerProvider = z.infer<typeof GitHubTriggerProvider>;

export const HttpTriggerProvider = z.object({
	type: z.literal("http"),
});
export type HttpTriggerProvider = z.infer<typeof HttpTriggerProvider>;

export const TriggerProvider = z.discriminatedUnion("type", [
	GitHubTriggerProvider,
	HttpTriggerProvider,
]);
export type TriggerProvider = z.infer<typeof TriggerProvider>;

export const TriggerProviderLike = z.object({
	type: z.string(),
});
export type TriggerProviderLike = z.infer<typeof TriggerProviderLike>;

export const TriggerContent = z.object({
	type: z.literal("trigger"),
	provider: TriggerProviderLike,
});
export type TriggerContent = z.infer<typeof TriggerContent>;
