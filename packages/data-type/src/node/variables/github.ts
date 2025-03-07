import { z } from "zod";
import { NodeBase } from "../base";

const GitHubResourceBase = z.object({
	url: z.string().url(),
	owner: z.string(),
	repo: z.string(),
	type: z.string(),
});
const GitHubCommit = GitHubResourceBase.extend({
	type: z.literal("commit"),
	commitSha: z.string(),
});
const GitHubPullRequest = GitHubResourceBase.extend({
	url: z.string().url(),
	owner: z.string(),
	repo: z.string(),
	type: z.literal("pull_request"),
	number: z.number(),
	reviewCommentId: z.string().optional(),
});

const GitHubObjectType = z.enum(["issue", "issueComment"]);
const GitHubObjectReference = z.object({
	url: z.string().url(),
	owner: z.string(),
	repo: z.string(),
	type: GitHubObjectType,
	id: z.string(),
});
export const GitHubContent = z.object({
	type: z.literal("github"),
	objectReferences: z.array(GitHubObjectReference),
});

export const GitHubNode = NodeBase.extend({
	type: z.literal("variable"),
	content: GitHubContent,
});

export const GitHubContentReference = z.object({
	type: GitHubContent.shape.type,
});
export type GitHubContentReference = z.infer<typeof GitHubContentReference>;
