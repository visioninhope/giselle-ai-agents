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

/**
 * Configuration for GitHub Pull Requests loader
 */
export type GitHubPullRequestsLoaderConfig = {
	owner: string;
	repo: string;

	perPage?: number;
	maxPages?: number;

	// Processing options
	maxContentLength?: number;
};
