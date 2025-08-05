import type { GitHubQueryContext } from "@giselle-sdk/giselle";
import type { QueryResult } from "@giselle-sdk/rag";
import { and, eq, inArray } from "drizzle-orm";
import { db, githubRepositoryPullRequestEmbeddings } from "@/drizzle";
import { resolveGitHubRepositoryIndex } from "../resolve-github-repository-index";
import type { GitHubPullRequestMetadata } from "./schema";

/**
 * Fetches PR context (title and body) for the given PR numbers
 */
async function fetchPRContexts(
	repositoryIndexDbId: number,
	prNumbers: number[],
): Promise<Map<number, { content: string }>> {
	const prContexts = await db
		.select({
			prNumber: githubRepositoryPullRequestEmbeddings.prNumber,
			content: githubRepositoryPullRequestEmbeddings.chunkContent,
		})
		.from(githubRepositoryPullRequestEmbeddings)
		.where(
			and(
				eq(
					githubRepositoryPullRequestEmbeddings.repositoryIndexDbId,
					repositoryIndexDbId,
				),
				eq(githubRepositoryPullRequestEmbeddings.contentType, "title_body"),
				inArray(githubRepositoryPullRequestEmbeddings.prNumber, prNumbers),
			),
		);

	const prContextMap = new Map<number, { content: string }>();
	for (const context of prContexts) {
		prContextMap.set(context.prNumber, {
			content: context.content,
		});
	}

	return prContextMap;
}

/**
 * Adds PR context to query results for comment/diff chunks
 */
export async function addPRContextToResults(
	results: QueryResult<GitHubPullRequestMetadata>[],
	context: GitHubQueryContext,
): Promise<QueryResult<GitHubPullRequestMetadata>[]> {
	// Find PR numbers that need context (comment/diff chunks)
	const prNumbersNeedingContext: number[] = [
		...new Set(
			results
				.filter((r) => r.metadata.contentType !== "title_body")
				.map((r) => r.metadata.prNumber),
		),
	];

	// If no PR contexts needed, return results as-is
	if (prNumbersNeedingContext.length === 0) {
		return results;
	}

	// Fetch PR contexts
	const repositoryIndexDbId = await resolveGitHubRepositoryIndex(context);
	const prContextMap = await fetchPRContexts(
		repositoryIndexDbId,
		prNumbersNeedingContext,
	);

	// Add PR context to results that need it
	return results.map((result) => {
		if (result.metadata.contentType !== "title_body") {
			const context = prContextMap.get(result.metadata.prNumber);
			if (context) {
				return {
					...result,
					additional: { prContext: context.content },
				};
			}
		}
		return result;
	});
}
