import {
	createGitHubBlobDownloadLoader,
	createGitHubBlobLoader,
} from "@giselle-sdk/github-tool";
import { createPipeline } from "@giselle-sdk/rag";
import type { Octokit } from "@octokit/core";
import type { TelemetrySettings } from "ai";
import { and, eq } from "drizzle-orm";
import { db, githubRepositoryIndex } from "@/drizzle";
import { createGitHubBlobChunkStore } from "./chunk-store";

/**
 * Ingest GitHub blobs into the vector store
 * Uses different loaders based on whether this is an initial ingest
 */
export async function ingestGitHubBlobs(params: {
	octokitClient: Octokit;
	source: { owner: string; repo: string; commitSha: string };
	teamDbId: number;
	telemetry?: TelemetrySettings;
}): Promise<void> {
	const { repositoryIndexDbId, isInitialIngest } = await getRepositoryIndexInfo(
		params.source,
		params.teamDbId,
	);

	const githubLoader = isInitialIngest
		? createGitHubBlobDownloadLoader(params.octokitClient, params.source, {
				maxBlobSize: 1 * 1024 * 1024,
			})
		: createGitHubBlobLoader(params.octokitClient, params.source, {
				maxBlobSize: 1 * 1024 * 1024,
			});
	const chunkStore = createGitHubBlobChunkStore(repositoryIndexDbId);

	const ingest = createPipeline({
		documentLoader: githubLoader,
		chunkStore,
		documentKey: (metadata) => metadata.path,
		documentVersion: (metadata) => metadata.fileSha,
		metadataTransform: (metadata) => ({
			repositoryIndexDbId,
			fileSha: metadata.fileSha,
			path: metadata.path,
		}),
		telemetry: params.telemetry,
	});

	const result = await ingest();
	console.log(
		`Ingested from ${result.totalDocuments} documents with success: ${result.successfulDocuments}, failure: ${result.failedDocuments}`,
	);
}

/**
 * Get repository index info including whether this is an initial ingest
 */
async function getRepositoryIndexInfo(
	source: { owner: string; repo: string },
	teamDbId: number,
): Promise<{ repositoryIndexDbId: number; isInitialIngest: boolean }> {
	const repositoryIndex = await db
		.select({
			dbId: githubRepositoryIndex.dbId,
			lastIngestedCommitSha: githubRepositoryIndex.lastIngestedCommitSha,
		})
		.from(githubRepositoryIndex)
		.where(
			and(
				eq(githubRepositoryIndex.owner, source.owner),
				eq(githubRepositoryIndex.repo, source.repo),
				eq(githubRepositoryIndex.teamDbId, teamDbId),
			),
		)
		.limit(1);

	if (repositoryIndex.length === 0) {
		throw new Error(
			`Repository index not found: ${source.owner}/${source.repo}`,
		);
	}

	const { dbId, lastIngestedCommitSha } = repositoryIndex[0];
	const isInitialIngest = lastIngestedCommitSha === null;

	return { repositoryIndexDbId: dbId, isInitialIngest };
}
