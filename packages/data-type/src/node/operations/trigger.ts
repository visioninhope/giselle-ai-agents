import { z } from "zod";

export const ManualTriggerProvider = z.object({
	provider: z.literal("manual"),
});
export type ManualTriggerProvider = z.infer<typeof ManualTriggerProvider>;

const GitHubTriggerProviderUnconfigured = z.object({
	status: z.literal("unconfigured"),
});
const GitHubTriggerProviderConfigured = z.object({
	status: z.literal("configured"),
	installationId: z.number(),
	repositoryNodeId: z.string(),
	eventId: z.string(),
});
const GitHubTriggerProviderState = z.discriminatedUnion("status", [
	GitHubTriggerProviderUnconfigured,
	GitHubTriggerProviderConfigured,
]);
export const GitHubTriggerProvider = z.object({
	provider: z.literal("github"),
	state: GitHubTriggerProviderState,
});
export type GitHubTriggerProvider = z.infer<typeof GitHubTriggerProvider>;

export const TriggerProvider = z.discriminatedUnion("provider", [
	ManualTriggerProvider,
	GitHubTriggerProvider,
]);
export type TriggerProvider = z.infer<typeof TriggerProvider>;
export function isTriggerProvider(value: unknown): value is TriggerProvider {
	return TriggerProvider.safeParse(value).success;
}

export const TriggerProviderLike = z
	.object({
		provider: z.string(),
	})
	.passthrough();
export type TriggerProviderLike = z.infer<typeof TriggerProviderLike>;

export const TriggerContent = z.object({
	type: z.literal("trigger"),
	source: TriggerProviderLike,
});
export type TriggerContent = z.infer<typeof TriggerContent>;

export const TriggerContentReference = z.object({
	type: TriggerContent.shape.type,
});
export type TriggerContentReference = z.infer<typeof TriggerContentReference>;
