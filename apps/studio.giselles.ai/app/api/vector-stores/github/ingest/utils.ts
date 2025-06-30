import {
	type GitHubRepositoryIndexStatus,
	db,
	githubRepositoryIndex,
} from "@/drizzle";
import { octokit } from "@giselle-sdk/github-tool";
import { and, eq, isNull, lt, or } from "drizzle-orm";
import type { TargetGitHubRepository } from "./types";

export function buildOctokit(installationId: number) {
	const appId = process.env.GITHUB_APP_ID;
	if (!appId) {
		throw new Error("GITHUB_APP_ID is empty");
	}
	const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
	if (!privateKey) {
		throw new Error("GITHUB_APP_PRIVATE_KEY is empty");
	}

	return octokit({
		strategy: "app-installation",
		appId,
		privateKey,
		installationId,
	});
}

/**
 * Fetch target GitHub repositories to ingest
 *
 * target repositories are:
 * - idle
 * - failed (only if retryable or isRetryable is null for backward compatibility)
 * - running and updated more than 15 minutes ago (stale)
 * - completed and updated more than 24 hours ago (outdated)
 *
 * @returns Target GitHub repositories to ingest
 */
export async function fetchTargetGitHubRepositories(): Promise<
	TargetGitHubRepository[]
> {
	// To prevent the race condition, consider running status as stale if it hasn't been updated for 15 minutes (> 800 seconds)
	const staleThreshold = new Date(Date.now() - 15 * 60 * 1000);
	// To update repository which updated more than 24 hours ago
	const outdatedThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

	const records = await db
		.select({
			dbId: githubRepositoryIndex.dbId,
			owner: githubRepositoryIndex.owner,
			repo: githubRepositoryIndex.repo,
			installationId: githubRepositoryIndex.installationId,
			lastIngestedCommitSha: githubRepositoryIndex.lastIngestedCommitSha,
			teamDbId: githubRepositoryIndex.teamDbId,
			status: githubRepositoryIndex.status,
			isRetryable: githubRepositoryIndex.isRetryable,
		})
		.from(githubRepositoryIndex)
		.where(
			or(
				eq(githubRepositoryIndex.status, "idle"),
				// Only include failed repositories that are retryable
				and(
					eq(githubRepositoryIndex.status, "failed"),
					or(
						eq(githubRepositoryIndex.isRetryable, true),
						// Include repositories without isRetryable set (backward compatibility)
						isNull(githubRepositoryIndex.isRetryable),
					),
				),
				and(
					eq(githubRepositoryIndex.status, "running"),
					lt(githubRepositoryIndex.updatedAt, staleThreshold),
				),
				and(
					eq(githubRepositoryIndex.status, "completed"),
					lt(githubRepositoryIndex.updatedAt, outdatedThreshold),
				),
			),
		);

	return records.map((record) => ({
		dbId: record.dbId,
		owner: record.owner,
		repo: record.repo,
		installationId: record.installationId,
		lastIngestedCommitSha: record.lastIngestedCommitSha,
		teamDbId: record.teamDbId,
	}));
}

export async function updateRepositoryStatusToRunning(dbId: number) {
	await updateRepositoryStatus(dbId, "running");
}

export async function updateRepositoryStatusToCompleted(
	dbId: number,
	commitSha: string,
) {
	await updateRepositoryStatus(dbId, "completed", commitSha);
}

export async function updateRepositoryStatusToFailed(
	dbId: number,
	errorInfo?: {
		isRetryable: boolean;
		errorCode: string;
	},
) {
	await db
		.update(githubRepositoryIndex)
		.set({
			status: "failed",
			errorCode: errorInfo?.errorCode ?? null,
			isRetryable: errorInfo?.isRetryable ?? null,
		})
		.where(eq(githubRepositoryIndex.dbId, dbId));
}

async function updateRepositoryStatus(
	dbId: number,
	status: Exclude<GitHubRepositoryIndexStatus, "idle">,
	commitSha?: string,
): Promise<void> {
	const updates: Partial<typeof githubRepositoryIndex.$inferInsert> = {
		status,
		errorCode: null,
		isRetryable: null,
	};

	if (commitSha != null) {
		updates.lastIngestedCommitSha = commitSha;
	}

	await db
		.update(githubRepositoryIndex)
		.set(updates)
		.where(eq(githubRepositoryIndex.dbId, dbId));
}
