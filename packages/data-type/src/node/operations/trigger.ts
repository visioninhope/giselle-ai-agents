import { z } from "zod";

export const ManualTriggerProviderData = z.object({
	provider: z.literal("manual"),
});
export type ManualTriggerProviderData = z.infer<
	typeof ManualTriggerProviderData
>;

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
export const GitHubTriggerProviderData = z.object({
	provider: z.literal("github"),
	state: GitHubTriggerProviderState,
});
export type GitHubTriggerProviderData = z.infer<
	typeof GitHubTriggerProviderData
>;

export const TriggerProviderData = z.discriminatedUnion("provider", [
	ManualTriggerProviderData,
	GitHubTriggerProviderData,
]);
export type TriggerProviderData = z.infer<typeof TriggerProviderData>;
export function isTriggerProviderData(
	value: unknown,
): value is TriggerProviderData {
	return TriggerProviderData.safeParse(value).success;
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
