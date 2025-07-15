type GithubPullRequestContentType = "title_body" | "comment" | "diff";

/**
 * Metadata for GitHub Pull Request documents
 *
 * Each PR generates separate documents
 * - title+body
 * - comments
 * - diffs
 */
export type GitHubPullRequestMetadata = {
	owner: string;
	repo: string;
	pr_number: number;
	content_type: GithubPullRequestContentType;
	content_id: string; // comment ID or file path, "title_body" for title+body
	merged_at: string;
};

// Configuration for GitHub Pull Requests loader
// Only processes merged pull requests for vector search
export type GitHubPullRequestsLoaderConfig = {
	owner: string;
	repo: string;

	perPage?: number;
	maxPages?: number;

	// Processing options
	maxDiffSize?: number;
	maxCommentLength?: number;
	skipFiles?: string[];
	skipBotComments?: boolean;
	skipGeneratedFiles?: boolean;
};

// Internal types for API responses
export type PullRequestListItem = {
	number: number;
};

export type PullRequestDetail = {
	title: string;
	body: string | null;
	merged: boolean;
	merged_at: string | null;
};

export type IssueComment = {
	id: number;
	body: string;
	user: {
		type: string;
	} | null;
};

export type PullRequestFile = {
	filename: string;
	patch?: string;
};
