import type { GitHubActionComandId } from "@giselle-sdk/flow";
import { z } from "zod";

const GitHubActionCommandUnconfiguredState = z.object({
	status: z.literal("unconfigured"),
});
const GitHubActionCommandCofiguredState = z.object({
	status: z.literal("configured"),
	commandId: z.custom<GitHubActionComandId>(),
	installationId: z.number(),
	repositoryNodeId: z.string(),
});

const GitHubActionCommandData = z.object({
	provider: z.literal("github"),
	state: z.discriminatedUnion("status", [
		GitHubActionCommandUnconfiguredState,
		GitHubActionCommandCofiguredState,
	]),
});

export const ActionContent = z.object({
	type: z.literal("action"),
	command: GitHubActionCommandData,
});
export type ActionContent = z.infer<typeof ActionContent>;

export const ActionContentReference = z.object({
	type: ActionContent.shape.type,
});
export type ActionContentReference = z.infer<typeof ActionContentReference>;
