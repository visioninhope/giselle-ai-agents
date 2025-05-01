import { z } from "zod";
import type { TriggerBase } from "../base";

export const provider = "github" as const;
export interface GitHubTrigger extends TriggerBase {
	provider: typeof provider;
}

export const githubIssueCreatedTrigger = {
	provider,
	event: {
		id: "github.issue.created",
		label: "Created an issue",
		payloads: z.object({
			title: z.string(),
			body: z.string(),
			repositoryOwner: z.string(),
			repositoryName: z.string(),
		}),
	},
} as const satisfies GitHubTrigger;

export const githubIssueCommentCreatedTrigger = {
	provider,
	event: {
		id: "github.issue_comment.created",
		label: "Created an issue comment",
		payloads: z.object({
			body: z.string(),
			issueNumber: z.number(),
			issueTitle: z.string(),
			issueBody: z.string(),
			repositoryOwner: z.string(),
			repositoryName: z.string(),
		}),
	},
} as const satisfies GitHubTrigger;

export const triggers = [
	githubIssueCreatedTrigger,
	githubIssueCommentCreatedTrigger,
] as const;

export type TriggerEventId = (typeof triggers)[number]["event"]["id"];
