export type Comment = {
	id: string;
	body: string;
	authorType: "User" | "Bot" | string;
};

export type FileMetadata = {
	isGenerated: boolean;
	isBinary: boolean;
	byteSize?: number;
	extension?: string;
	language?: string;
	lineCount?: number;
};

export type PullRequestInfo = {
	title: string;
	body: string | null;
	merged: boolean;
	mergedAt: string | null;
	files: Map<string, FileMetadata>;
	comments: Comment[];
};

export type CacheKey = `${string}/${string}/${number}`;

export const pullRequestCache = new Map<CacheKey, Promise<PullRequestInfo>>();
export const diffsCache = new Map<CacheKey, Promise<Map<string, string>>>();

export function createCacheKey(
	owner: string,
	repo: string,
	prNumber: number,
): CacheKey {
	return `${owner}/${repo}/${prNumber}`;
}
