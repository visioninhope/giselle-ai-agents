import { z } from "zod";

export const Provider = z.literal("github");

const GitHubIssueCreatedTriggerEvent = z.object({
	id: z.literal("github.issue.created"),
});

const GitHubIssueCommentCreatedTrigger = z.object({
	id: z.literal("github.issue_comment.created"),
	conditions: z.object({
		callsign: z.string(),
	}),
});

export const GitHubTrigger = z.object({
	provider: Provider,
	event: z.discriminatedUnion("id", [
		GitHubIssueCreatedTriggerEvent,
		GitHubIssueCommentCreatedTrigger,
	]),
	installationId: z.number(),
	repositoryNodeId: z.string(),
});
