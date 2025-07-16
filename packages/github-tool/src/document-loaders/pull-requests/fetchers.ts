import { DocumentLoaderError } from "@giselle-sdk/rag";
import type { Octokit } from "@octokit/core";
import { RequestError } from "@octokit/request-error";
import type { Client } from "urql";
import type { Comment, FileMetadata, PullRequestInfo } from "./cache";
import { GetPullRequestInfoQuery } from "./queries";

export type PullRequestListItem = {
	number: number;
};

export type FetchContext = {
	client: Client;
	owner: string;
	repo: string;
};

export async function fetchPullRequestInfo(
	ctx: FetchContext,
	prNumber: number,
): Promise<PullRequestInfo> {
	const result = await ctx.client.query(GetPullRequestInfoQuery, {
		owner: ctx.owner,
		repo: ctx.repo,
		number: prNumber,
		commentLimit: 100, // GitHub GraphQL API maximum
	});

	if (result.error) {
		throw new Error(`GraphQL error: ${result.error.message}`);
	}
	const pr = result.data?.repository?.pullRequest;
	if (!pr) {
		throw new Error(`Pull request #${prNumber} not found`);
	}

	// Extract file metadata
	const files = new Map<string, FileMetadata>();
	const headCommit = pr.headCommit.nodes?.[0]?.commit;
	if (headCommit?.tree) {
		const entries = headCommit.tree.entries || [];
		for (const entry of entries) {
			if (entry.object?.__typename === "Blob" && entry.path) {
				const blob = entry.object;
				files.set(entry.path, {
					isGenerated: entry.isGenerated,
					isBinary: blob.isBinary,
					byteSize: blob.byteSize,
					extension: entry.extension,
					language: entry.language?.name ?? null,
					lineCount: entry.lineCount,
				});
			}
		}
	}

	// Extract comments
	// Using 'last: 100' to get the most recent comments (newest first).
	// If hasPreviousPage is true, older comments will be missed.
	// This is acceptable for vector search where recent comments are typically
	// more relevant than older ones.
	if (pr.comments.pageInfo.hasPreviousPage) {
		console.warn(
			`Pull request ${ctx.owner}/${ctx.repo}/pull/${prNumber} has more than 100 comments.`,
		);
	}

	const comments: Comment[] = [];
	const commentNodes = pr.comments.nodes || [];
	for (const comment of commentNodes) {
		if (comment == null) {
			continue;
		}
		comments.push({
			id: comment.id,
			body: comment.body,
			authorType: comment.author?.__typename || "Unknown",
		});
	}

	return {
		title: pr.title,
		body: pr.body,
		merged: pr.merged,
		mergedAt: pr.mergedAt,
		files,
		comments,
	};
}

export type DiffFetchContext = {
	octokit: Octokit;
	owner: string;
	repo: string;
};

// Retrieve the diff for the entire pull request using the REST API and split it by file
export async function fetchDiffs(
	ctx: DiffFetchContext,
	prNumber: number,
): Promise<Map<string, string>> {
	const response = await executeRestRequest(
		() =>
			ctx.octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
				owner: ctx.owner,
				repo: ctx.repo,
				pull_number: prNumber,
				headers: {
					accept: "application/vnd.github.v3.diff",
				},
			}),
		"Pull Request Diff",
		`${ctx.owner}/${ctx.repo}/pulls/${prNumber}`,
	);

	const diffText = response.data as unknown as string;
	const fileDiffs = new Map<string, string>();

	const fileChunks = diffText.split(/^diff --git /m).slice(1);

	for (const chunk of fileChunks) {
		const filenameMatch = chunk.match(/^a\/(.+?) b\//);
		if (!filenameMatch) continue;

		const filename = filenameMatch[1];
		fileDiffs.set(filename, `diff --git ${chunk}`);
	}

	return fileDiffs;
}

export type PullRequestListContext = {
	octokit: Octokit;
	owner: string;
	repo: string;
};

export async function fetchAllPullRequests(
	ctx: PullRequestListContext,
	options: {
		state: "open" | "closed" | "all";
		sort: "created" | "updated" | "popularity" | "long-running";
		direction: "asc" | "desc";
		perPage: number;
		maxPages: number;
	},
): Promise<PullRequestListItem[]> {
	const pullRequests: PullRequestListItem[] = [];
	let page = 1;

	while (page <= options.maxPages) {
		const { data } = await executeRestRequest(
			() =>
				ctx.octokit.request("GET /repos/{owner}/{repo}/pulls", {
					owner: ctx.owner,
					repo: ctx.repo,
					state: options.state,
					sort: options.sort,
					direction: options.direction,
					per_page: options.perPage,
					page,
				}),
			"Pull Requests",
			`${ctx.owner}/${ctx.repo}/pulls`,
		);

		if (data.length === 0) {
			break;
		}

		// Extract only essential fields for lightweight metadata
		pullRequests.push(
			...data.map((pr) => ({
				number: pr.number,
			})),
		);

		if (data.length < options.perPage) {
			break;
		}

		page++;
	}

	return pullRequests;
}

/**
 * Execute a GitHub REST API request with retry logic and error handling
 */
async function executeRestRequest<T>(
	operation: () => Promise<T>,
	resourceType: string,
	resourcePath: string,
	currentAttempt = 0,
	maxAttempt = 3,
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		if (error instanceof RequestError) {
			// Handle 5xx errors with retry
			if (error.status && error.status >= 500) {
				if (currentAttempt >= maxAttempt) {
					throw DocumentLoaderError.fetchError(
						"github",
						`fetching ${resourceType}`,
						error,
						{
							statusCode: error.status,
							resourceType,
							resourcePath,
							retryAttempts: currentAttempt,
							maxAttempts: maxAttempt,
						},
					);
				}
				await new Promise((resolve) =>
					setTimeout(resolve, 2 ** currentAttempt * 1000),
				);
				return executeRestRequest(
					operation,
					resourceType,
					resourcePath,
					currentAttempt + 1,
					maxAttempt,
				);
			}

			// Handle 404 errors
			if (error.status === 404) {
				throw DocumentLoaderError.notFound(resourcePath, error, {
					source: "github",
					resourceType,
					statusCode: 404,
				});
			}

			// Handle rate limit errors (403, 429)
			if (error.status === 403 || error.status === 429) {
				throw DocumentLoaderError.rateLimited(
					"github",
					error.response?.headers?.["retry-after"],
					error,
					{
						statusCode: error.status,
						resourceType,
						resourcePath,
					},
				);
			}

			// Other 4xx errors
			if (error.status && error.status >= 400 && error.status < 500) {
				throw DocumentLoaderError.fetchError(
					"github",
					`fetching ${resourceType}`,
					error,
					{
						statusCode: error.status,
						resourceType,
						resourcePath,
						errorMessage: error.message,
					},
				);
			}
		}
		// Re-throw any other errors
		throw error;
	}
}
