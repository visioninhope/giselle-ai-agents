import { fetchDefaultBranchHead } from "@giselle-sdk/github-tool";
import { DocumentLoaderError, RagError } from "@giselle-sdk/rag";
import { captureException } from "@sentry/nextjs";
import type { NextRequest } from "next/server";
import { ingestGitHubBlobs } from "./ingest-github-repository";
import type { TargetGitHubRepository } from "./types";
import {
	buildOctokit,
	fetchTargetGitHubRepositories,
	updateRepositoryStatusToCompleted,
	updateRepositoryStatusToFailed,
	updateRepositoryStatusToRunning,
} from "./utils";

export const maxDuration = 800;

export async function GET(request: NextRequest) {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return new Response("Unauthorized", {
			status: 401,
		});
	}

	const targetGitHubRepositories = await fetchTargetGitHubRepositories();

	await Promise.all(targetGitHubRepositories.map(processRepository));

	return new Response("ok", { status: 200 });
}

async function processRepository(
	targetGitHubRepository: TargetGitHubRepository,
) {
	const { owner, repo, installationId, teamDbId, dbId } =
		targetGitHubRepository;

	try {
		await updateRepositoryStatusToRunning(dbId);

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
		});

		await updateRepositoryStatusToCompleted(dbId, commit.sha);
	} catch (error) {
		console.error(
			`Failed to ingest GitHub Repository: teamDbId=${teamDbId}, repository=${owner}/${repo}`,
			error,
		);

		// Determine if error is retryable
		let shouldRetry = true; // Default: retry all errors
		let errorCode = "UNKNOWN";
		let retryAfter: Date | null = null;

		if (error instanceof RagError) {
			shouldRetry = error.isRetryable();
			errorCode = error.code;

			if (error instanceof DocumentLoaderError) {
				const retryAfterDate = error.getRetryAfterDate();
				if (retryAfterDate) {
					retryAfter = retryAfterDate;
				}
			}
		}

		captureException(error, {
			extra: {
				owner,
				repo,
				teamDbId,
				shouldRetry,
				errorCode,
				retryAfter,
				errorContext:
					error instanceof DocumentLoaderError ? error.context : undefined,
			},
		});

		await updateRepositoryStatusToFailed(dbId, {
			isRetryable: shouldRetry,
			errorCode: errorCode,
			retryAfter,
		});
	}
}
