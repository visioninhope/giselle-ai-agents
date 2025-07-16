import type { Document, DocumentLoader } from "@giselle-sdk/rag";
import type { Octokit } from "@octokit/core";
import type { Client } from "urql";
import { graphql } from "../../client";
import type { GitHubAuthConfig } from "../../types";
import {
	createCacheKey,
	diffsCache,
	type PullRequestInfo,
	pullRequestCache,
} from "./cache";
import {
	type DiffFetchContext,
	type FetchContext,
	fetchAllPullRequests,
	fetchDiffs,
	fetchPullRequestInfo,
	type PullRequestListContext,
} from "./fetchers";
import type {
	GitHubPullRequestMetadata,
	GitHubPullRequestsLoaderConfig,
} from "./types";

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

	function getPullRequestInfo(prNumber: number): Promise<PullRequestInfo> {
		const cacheKey = createCacheKey(owner, repo, prNumber);

		const existingPromise = pullRequestCache.get(cacheKey);
		if (existingPromise) {
			return existingPromise;
		}

		const promise = getGraphQLClient().then((client) => {
			const ctx: FetchContext = { client, owner, repo };
			return fetchPullRequestInfo(ctx, prNumber);
		});

		pullRequestCache.set(cacheKey, promise);

		promise.catch(() => {
			pullRequestCache.delete(cacheKey);
		});

		return promise;
	}

	function getDiffs(prNumber: number): Promise<Map<string, string>> {
		const cacheKey = createCacheKey(owner, repo, prNumber);

		const existingPromise = diffsCache.get(cacheKey);
		if (existingPromise) {
			return existingPromise;
		}

		const promise = Promise.resolve().then(() => {
			const ctx: DiffFetchContext = { octokit, owner, repo };
			return fetchDiffs(ctx, prNumber);
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
			const ctx: PullRequestListContext = { octokit, owner, repo };
			const pullRequests = await fetchAllPullRequests(ctx, {
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
						// Skip if file is generated or definitely binary
						if (fileInfo.isGenerated || fileInfo.isBinary === true) {
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
