import { DocumentLoaderError } from "@giselle-sdk/rag";
import type { Octokit } from "@octokit/core";
import { RequestError } from "@octokit/request-error";
import type { Client } from "urql";
import type { Comment, FileMetadata, PullRequestDetails } from "./cache";
import {
	GetPullRequestDetailsQuery,
	GetPullRequestsMetadataQuery,
} from "./queries";

export type PullRequestListItem = {
	number: number;
};

export type FetchContext = {
	client: Client;
	owner: string;
	repo: string;
};

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

/**
 * Execute a GitHub REST API request with retry logic and error handling
 *
 * TODO: Other document loaders will use this, so we should move it to a shared location
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

export async function fetchPullRequestsMetadata(
	ctx: FetchContext,
	options: {
		first: number;
		after?: string | null;
	},
): Promise<{
	pullRequests: Array<{
		number: number;
		mergedAt: string | null;
		commentIds: string[];
		filePaths: string[];
	}>;
	pageInfo: {
		hasNextPage: boolean;
		endCursor: string | null;
	};
}> {
	const result = await ctx.client.query(GetPullRequestsMetadataQuery, {
		owner: ctx.owner,
		repo: ctx.repo,
		first: options.first,
		after: options.after,
	});

	if (result.error) {
		throw new Error(`GraphQL error: ${result.error.message}`);
	}

	const pullRequests = result.data?.repository?.pullRequests;
	if (!pullRequests) {
		throw new Error("Failed to fetch pull requests");
	}

	const prs =
		pullRequests.nodes
			?.map((pr) => {
				if (!pr) return null;

				const commentIds =
					pr.comments.nodes
						?.filter((c) => c && c.author?.__typename !== "Bot")
						.map((c) => c?.id)
						.filter((id): id is string => !!id) || [];

				const filePaths =
					pr.files?.nodes
						?.map((f) => f?.path)
						.filter((path): path is string => !!path) || [];

				return {
					number: pr.number,
					mergedAt: pr.mergedAt,
					commentIds,
					filePaths,
				};
			})
			.filter((pr): pr is NonNullable<typeof pr> => pr !== null) || [];

	return {
		pullRequests: prs,
		pageInfo: {
			hasNextPage: pullRequests.pageInfo.hasNextPage,
			endCursor: pullRequests.pageInfo.endCursor,
		},
	};
}

export async function fetchPullRequestDetails(
	ctx: FetchContext,
	prNumber: number,
): Promise<PullRequestDetails> {
	const result = await ctx.client.query(GetPullRequestDetailsQuery, {
		owner: ctx.owner,
		repo: ctx.repo,
		number: prNumber,
	});

	if (result.error) {
		throw new Error(`GraphQL error: ${result.error.message}`);
	}

	const pr = result.data?.repository?.pullRequest;
	if (!pr) {
		throw new Error(`Pull request #${prNumber} not found`);
	}

	// Extract comments
	const comments: Comment[] = [];
	for (const comment of pr.comments.nodes || []) {
		if (comment) {
			comments.push({
				id: comment.id,
				body: comment.body,
				authorType: comment.author?.__typename || "Unknown",
			});
		}
	}

	// Extract file metadata
	const files = new Map<string, FileMetadata>();
	const headCommit = pr.headCommit.nodes?.[0]?.commit;
	if (headCommit?.tree) {
		for (const entry of headCommit.tree.entries || []) {
			if (entry.object?.__typename === "Blob" && entry.path) {
				files.set(entry.path, {
					isGenerated: entry.isGenerated,
					isBinary: entry.object.isBinary,
					byteSize: entry.object.byteSize,
					extension: entry.extension,
					language: null,
					lineCount: entry.lineCount,
				});
			}
		}
	}

	return {
		title: pr.title,
		body: pr.body,
		comments,
		files,
	};
}
