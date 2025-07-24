import { fetchDefaultBranchHead } from "@giselle-sdk/github-tool";
import { DocumentLoaderError, RagError } from "@giselle-sdk/rag";
import { captureException } from "@sentry/nextjs";
import type { TelemetrySettings } from "ai";
import { and, eq, max } from "drizzle-orm";
import {
	db,
	githubRepositoryContentStatus,
	type githubRepositoryIndex,
	githubRepositoryPullRequestEmbeddings,
} from "@/drizzle";
import type { RepositoryWithStatuses } from "../types";
import { createBlobMetadata, createPullRequestMetadata } from "../types";
import { ingestGitHubBlobs } from "./blobs/ingest-github-blobs";
import { buildGitHubAuthConfig, buildOctokit } from "./build-octokit";
import { ingestGitHubPullRequests } from "./pull-requests/ingest-github-pull-requests";
import { createIngestTelemetrySettings } from "./telemetry";

/**
 * Process a GitHub repository for ingestion
 * This is the main entry point for ingesting a repository
 */
export async function processRepository(
	repositoryData: RepositoryWithStatuses,
) {
	const { repositoryIndex, contentStatuses } = repositoryData;
	const { owner, repo, teamDbId } = repositoryIndex;

	const telemetry = await createIngestTelemetrySettings(
		teamDbId,
		`${owner}/${repo}`,
	);

	for (const contentStatus of contentStatuses) {
		try {
			await updateContentStatus(
				repositoryIndex.dbId,
				contentStatus.contentType,
				{
					status: "running",
				},
			);

			switch (contentStatus.contentType) {
				case "blob":
					await processBlobs({
						repositoryIndex,
						telemetry,
					});
					break;
				case "pull_request":
					await processPullRequests({
						repositoryIndex,
						telemetry,
					});
					break;
				default: {
					const _exhaustiveCheck: never = contentStatus.contentType;
					throw new Error(`Unknown content type: ${_exhaustiveCheck}`);
				}
			}
		} catch (error) {
			console.error(
				`Failed to ingest ${contentStatus.contentType} for GitHub Repository: teamDbId=${teamDbId}, repository=${owner}/${repo}`,
				error,
			);

			const { errorCode, retryAfter } = extractErrorInfo(error);

			captureException(error, {
				extra: {
					owner,
					repo,
					teamDbId,
					contentType: contentStatus.contentType,
					errorCode,
					retryAfter,
					errorContext:
						error instanceof DocumentLoaderError ? error.context : undefined,
				},
			});

			await updateContentStatus(
				repositoryIndex.dbId,
				contentStatus.contentType,
				{
					status: "failed",
					errorCode,
					retryAfter,
				},
			);
		}
	}
}

/**
 * Process blob content for a repository
 */
async function processBlobs(params: {
	repositoryIndex: typeof githubRepositoryIndex.$inferSelect;
	telemetry?: TelemetrySettings;
}) {
	const { repositoryIndex, telemetry } = params;
	const { owner, repo, installationId, teamDbId, dbId } = repositoryIndex;

	const octokitClient = buildOctokit(installationId);
	const commit = await fetchDefaultBranchHead(octokitClient, owner, repo);
	const source = {
		owner,
		repo,
		commitSha: commit.sha,
	};

	await ingestGitHubBlobs({
		octokitClient,
		source,
		teamDbId,
		telemetry,
	});

	await updateContentStatus(dbId, "blob", {
		status: "completed",
		metadata: createBlobMetadata({
			lastIngestedCommitSha: commit.sha,
		}),
		lastSyncedAt: new Date(),
		errorCode: null,
		retryAfter: null,
	});
}

/**
 * Process pull request content for a repository
 */
async function processPullRequests(params: {
	repositoryIndex: typeof githubRepositoryIndex.$inferSelect;
	telemetry?: TelemetrySettings;
}) {
	const { repositoryIndex, telemetry } = params;
	const { owner, repo, installationId, teamDbId, dbId } = repositoryIndex;

	const source = {
		owner,
		repo,
	};

	await ingestGitHubPullRequests({
		githubAuthConfig: buildGitHubAuthConfig(installationId),
		source,
		teamDbId,
		telemetry,
	});

	const lastIngestedPrNumber = await getLastIngestedPrNumber(
		repositoryIndex.dbId,
	);

	await updateContentStatus(dbId, "pull_request", {
		status: "completed",
		metadata: createPullRequestMetadata({
			lastIngestedPrNumber: lastIngestedPrNumber ?? undefined,
		}),
		lastSyncedAt: new Date(),
		errorCode: null,
		retryAfter: null,
	});
}

async function getLastIngestedPrNumber(repositoryIndexDbId: number) {
	const results = await db
		.select({
			lastIngestedPrNumber: max(githubRepositoryPullRequestEmbeddings.prNumber),
		})
		.from(githubRepositoryPullRequestEmbeddings)
		.where(
			and(
				eq(
					githubRepositoryPullRequestEmbeddings.repositoryIndexDbId,
					repositoryIndexDbId,
				),
			),
		);
	if (results.length === 0) {
		return null;
	}

	return results[0].lastIngestedPrNumber;
}

/**
 * Extract error code and retry time from an error
 * @param error The error to extract information from
 * @returns Error code and retry time
 */
function extractErrorInfo(error: unknown): {
	errorCode: string;
	retryAfter: Date | null;
} {
	if (error instanceof DocumentLoaderError) {
		const errorCode = error.code;

		let retryAfter: Date | null;
		switch (error.code) {
			case "DOCUMENT_NOT_FOUND":
			case "DOCUMENT_TOO_LARGE":
				// Not retryable
				retryAfter = null;
				break;
			case "DOCUMENT_RATE_LIMITED":
				retryAfter = error.getRetryAfterDate() ?? new Date();
				break;
			case "DOCUMENT_FETCH_ERROR":
				retryAfter = new Date();
				break;
			default: {
				const _exhaustiveCheck: never = error.code;
				throw new Error(`Unknown error code: ${_exhaustiveCheck}`);
			}
		}

		return { errorCode, retryAfter };
	}

	if (error instanceof RagError) {
		return {
			errorCode: error.code,
			retryAfter: new Date(),
		};
	}

	return {
		errorCode: "UNKNOWN",
		retryAfter: new Date(),
	};
}

/**
 * Update content status for a specific content type
 */
async function updateContentStatus(
	repositoryIndexDbId: number,
	contentType: "blob" | "pull_request",
	update: {
		status: "running" | "completed" | "failed";
		metadata?:
			| ReturnType<typeof createBlobMetadata>
			| ReturnType<typeof createPullRequestMetadata>;
		lastSyncedAt?: Date;
		errorCode?: string | null;
		retryAfter?: Date | null;
	},
) {
	// For running status, ensure the record exists first
	if (update.status === "running") {
		const [existing] = await db
			.select()
			.from(githubRepositoryContentStatus)
			.where(
				and(
					eq(
						githubRepositoryContentStatus.repositoryIndexDbId,
						repositoryIndexDbId,
					),
					eq(githubRepositoryContentStatus.contentType, contentType),
				),
			)
			.limit(1);

		if (!existing) {
			throw new Error(
				`${contentType} content status not found for repository dbId: ${repositoryIndexDbId}`,
			);
		}
	}

	await db
		.update(githubRepositoryContentStatus)
		.set(update)
		.where(
			and(
				eq(
					githubRepositoryContentStatus.repositoryIndexDbId,
					repositoryIndexDbId,
				),
				eq(githubRepositoryContentStatus.contentType, contentType),
			),
		);
}
