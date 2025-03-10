import { z } from "zod";

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

export const GitHubContentReference = z.object({
	type: GitHubContent.shape.type,
});
export type GitHubContentReference = z.infer<typeof GitHubContentReference>;
