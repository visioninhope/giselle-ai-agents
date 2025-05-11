import type { GitHubActionComandId } from "@giselle-sdk/flow";
import { z } from "zod";

export const Provider = z.literal("github");

export const GitHubFlowAction = z.object({
	provider: Provider,
	commandId: z.custom<GitHubActionComandId>(),
	installationId: z.number(),
	repositoryNodeId: z.string(),
});
export type GitHubFlowAction = z.infer<typeof GitHubFlowAction>;
