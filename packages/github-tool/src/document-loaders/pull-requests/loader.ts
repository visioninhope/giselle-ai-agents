import type { Document, DocumentLoader } from "@giselle-sdk/rag";
import { DocumentLoaderError } from "@giselle-sdk/rag";
import type { Octokit } from "@octokit/core";
import { RequestError } from "@octokit/request-error";
import type { Client } from "urql";
import { graphql } from "../../client";
import type { GitHubAuthConfig } from "../../types";
import {
	type Comment,
	createCacheKey,
	diffsCache,
	type FileMetadata,
	type PullRequestInfo,
	pullRequestCache,
} from "./cache";
import { GetPullRequestInfoQuery } from "./queries";
import type {
	GitHubPullRequestMetadata,
	GitHubPullRequestsLoaderConfig,
} from "./types";

type PullRequestListItem = {
	number: number;
};

export function createGitHubPullRequestsLoader(
	octokit: Octokit,
	config: GitHubPullRequestsLoaderConfig,
	authConfig: GitHubAuthConfig,
): DocumentLoader<GitHubPullRequestMetadata> {
	const {
		owner,
		repo,
		perPage = 100,
		maxPages = 10,
		maxContentLength = 1024 * 8, // 8KB limit per content (diff/comment)
	} = config;

	let graphqlClient: Client | null = null;

	async function getGraphQLClient(): Promise<Client> {
		if (!graphqlClient) {
			graphqlClient = await graphql(authConfig);
		}
		return graphqlClient;
	}

	async function fetchPullRequestInfo(
		prNumber: number,
	): Promise<PullRequestInfo> {
		const client = await getGraphQLClient();
		const result = await client.query(GetPullRequestInfoQuery, {
			owner,
			repo,
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
		const entries = headCommit?.tree?.entries || [];
		for (const entry of entries) {
			const blob = entry.object?.__typename === "Blob" ? entry.object : null;
			// Only include Blob entries (actual files, not directories or submodules)
			if (blob) {
				files.set(entry.path || "", {
					isGenerated: entry.isGenerated,
					isBinary: blob.isBinary ?? false,
					byteSize: blob.byteSize,
					extension: entry.extension ?? undefined,
					language: entry.language?.name ?? undefined,
					lineCount: entry.lineCount ?? undefined,
				});
			}
		}

		// Extract comments
		// Note: Using 'last: 100' to get the most recent comments (newest first).
		// If hasPreviousPage is true, older comments will be missed.
		// This is acceptable for vector search where recent comments are typically
		// more relevant than older ones.
		const comments: Comment[] = [];
		const commentNodes = pr.comments?.nodes || [];
		for (const comment of commentNodes) {
			if (comment?.body) {
				comments.push({
					id: comment.id,
					body: comment.body,
					authorType: comment.author?.__typename || "Unknown",
				});
			}
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

	function getPullRequestInfo(prNumber: number): Promise<PullRequestInfo> {
		const cacheKey = createCacheKey(owner, repo, prNumber);

		const existingPromise = pullRequestCache.get(cacheKey);
		if (existingPromise) {
			return existingPromise;
		}

		const promise = new Promise<PullRequestInfo>((resolve, reject) => {
			fetchPullRequestInfo(prNumber).then(resolve).catch(reject);
		});

		pullRequestCache.set(cacheKey, promise);

		promise.catch(() => {
			pullRequestCache.delete(cacheKey);
		});

		return promise;
	}

	async function fetchDiffs(prNumber: number): Promise<Map<string, string>> {
		const response = await octokit.request(
			"GET /repos/{owner}/{repo}/pulls/{pull_number}",
			{
				owner,
				repo,
				pull_number: prNumber,
				headers: {
					accept: "application/vnd.github.v3.diff",
				},
			},
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

	function getDiffs(prNumber: number): Promise<Map<string, string>> {
		const cacheKey = createCacheKey(owner, repo, prNumber);

		const existingPromise = diffsCache.get(cacheKey);
		if (existingPromise) {
			return existingPromise;
		}

		const promise = new Promise<Map<string, string>>((resolve, reject) => {
			fetchDiffs(prNumber).then(resolve).catch(reject);
		});

		diffsCache.set(cacheKey, promise);

		promise.catch(() => {
			diffsCache.delete(cacheKey);
		});

		return promise;
	}

	const loadMetadata =
		async function* (): AsyncIterable<GitHubPullRequestMetadata> {
			// Fetch closed pull requests (to get merged ones)
			const pullRequests = await fetchAllPullRequests(octokit, owner, repo, {
				state: "closed",
				sort: "created",
				direction: "desc",
				perPage,
				maxPages,
			});

			for (const pr of pullRequests) {
				try {
					const prInfo = await getPullRequestInfo(pr.number);

					if (!prInfo.merged || !prInfo.mergedAt) {
						continue;
					}

					// Title + Body document
					yield {
						owner,
						repo,
						pr_number: pr.number,
						content_type: "title_body",
						content_id: "title_body",
						merged_at: prInfo.mergedAt,
					};

					// Comments documents
					for (const comment of prInfo.comments) {
						if (comment.authorType === "Bot") {
							continue;
						}

						if (comment.body.length > maxContentLength) {
							continue;
						}

						yield {
							owner,
							repo,
							pr_number: pr.number,
							content_type: "comment",
							content_id: comment.id,
							merged_at: prInfo.mergedAt,
						};
					}

					// File diffs documents
					for (const [filepath, fileInfo] of prInfo.files) {
						// Skip if file is generated or binary
						if (fileInfo.isGenerated || fileInfo.isBinary) {
							continue;
						}

						yield {
							owner,
							repo,
							pr_number: pr.number,
							content_type: "diff",
							content_id: filepath,
							merged_at: prInfo.mergedAt,
						};
					}
				} catch (error) {
					console.error(`Failed to process PR #${pr.number}:`, error);
				}
			}
		};

	const loadDocument = async (
		metadata: GitHubPullRequestMetadata,
	): Promise<Document<GitHubPullRequestMetadata> | null> => {
		const { pr_number, content_type, content_id } = metadata;

		try {
			switch (content_type) {
				case "title_body": {
					const prInfo = await getPullRequestInfo(pr_number);
					const content = `${prInfo.title}\n\n${prInfo.body || ""}`;

					return {
						content,
						metadata: {
							...metadata,
							merged_at: prInfo.mergedAt || metadata.merged_at,
						},
					};
				}

				case "comment": {
					const prInfo = await getPullRequestInfo(pr_number);
					const comment = prInfo.comments.find((c) => c.id === content_id);

					if (!comment) {
						return null;
					}

					return {
						content: comment.body,
						metadata: {
							...metadata,
							merged_at: prInfo.mergedAt || metadata.merged_at,
						},
					};
				}

				case "diff": {
					// Get PR info for merged_at metadata
					const prInfo = await getPullRequestInfo(pr_number);

					// Get the actual diff content
					const diffs = await getDiffs(pr_number);
					const diff = diffs.get(content_id);

					if (!diff) {
						return null;
					}

					const content = `File: ${content_id}\n\n${diff}`;

					return {
						content,
						metadata: {
							...metadata,
							merged_at: prInfo.mergedAt || metadata.merged_at,
						},
					};
				}

				default:
					return null;
			}
		} catch (error) {
			console.error(`Failed to load document for metadata:`, metadata, error);
			return null;
		}
	};

	return { loadMetadata, loadDocument };
}

/**
 * Execute an Octokit request with retry logic for 5xx errors
 */
async function executeWithRetry<T>(
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
				return executeWithRetry(
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

// API fetch functions
async function fetchAllPullRequests(
	octokit: Octokit,
	owner: string,
	repo: string,
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
		const { data } = await executeWithRetry(
			() =>
				octokit.request("GET /repos/{owner}/{repo}/pulls", {
					owner,
					repo,
					state: options.state,
					sort: options.sort,
					direction: options.direction,
					per_page: options.perPage,
					page,
				}),
			"Pull Requests",
			`${owner}/${repo}/pulls`,
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
