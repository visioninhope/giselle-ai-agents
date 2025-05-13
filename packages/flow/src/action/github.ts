import { z } from "zod";
import type { ActionBase } from "../base";

export const provider = "github" as const;

export interface GitHubAction extends ActionBase {
	provider: typeof provider;
}

export const githubCreateIssueAction = {
	provider,
	command: {
		id: "github.create.issue",
		label: "Create Issue",
		parameters: z.object({
			title: z.string(),
			body: z.string(),
		}),
	},
} as const satisfies GitHubAction;

export const githubCreateIssueCommentAction = {
	provider,
	command: {
		id: "github.create.issueComment",
		label: "Create Issue Comment",
		parameters: z.object({
			issueNumber: z.number(),
			body: z.string(),
		}),
	},
} as const satisfies GitHubAction;

export const actions = [
	githubCreateIssueAction,
	githubCreateIssueCommentAction,
] as const;

export type ActionCommandId = (typeof actions)[number]["command"]["id"];
