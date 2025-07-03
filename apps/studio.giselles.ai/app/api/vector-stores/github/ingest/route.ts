import { db, subscriptions, teams } from "@/drizzle";
import { fetchDefaultBranchHead } from "@giselle-sdk/github-tool";
import { DocumentLoaderError, RagError } from "@giselle-sdk/rag";
import { captureException } from "@sentry/nextjs";
import type { TelemetrySettings } from "ai";
import { and, eq } from "drizzle-orm";
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

		// Get team information for telemetry
		const teamInfo = await db
			.select({
				type: teams.type,
				activeSubscriptionId: subscriptions.id,
			})
			.from(teams)
			.leftJoin(
				subscriptions,
				and(
					eq(subscriptions.teamDbId, teams.dbId),
					eq(subscriptions.status, "active"),
				),
			)
			.where(eq(teams.dbId, teamDbId))
			.limit(1);

		const experimental_telemetry: TelemetrySettings | undefined = teamInfo[0]
			? {
					metadata: {
						teamDbId,
						teamType: teamInfo[0].type,
						isProPlan:
							teamInfo[0].activeSubscriptionId != null ||
							teamInfo[0].type === "internal",
						subscriptionId: teamInfo[0].activeSubscriptionId ?? "",
						repository: `${owner}/${repo}`,
						// Note: userId is not available in cron job context
						// This is a system-initiated operation
						operation: "github-repository-ingest",
						tags: ["auto-instrumented", "embedding", "github-ingest"],
					},
				}
			: undefined;

		await ingestGitHubBlobs({
			octokitClient,
			source,
			teamDbId,
			experimental_telemetry,
		});

		await updateRepositoryStatusToCompleted(dbId, commit.sha);
	} catch (error) {
		console.error(
			`Failed to ingest GitHub Repository: teamDbId=${teamDbId}, repository=${owner}/${repo}`,
			error,
		);

		const { errorCode, retryAfter } = extractErrorInfo(error);

		captureException(error, {
			extra: {
				owner,
				repo,
				teamDbId,
				errorCode,
				retryAfter,
				errorContext:
					error instanceof DocumentLoaderError ? error.context : undefined,
			},
		});

		await updateRepositoryStatusToFailed(dbId, {
			errorCode,
			retryAfter,
		});
	}
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
