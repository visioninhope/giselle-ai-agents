import { and, eq, isNotNull, lt, or } from "drizzle-orm";
import { db, githubRepositoryIndex } from "@/drizzle";
import type { TargetGitHubRepository } from "../types";

const STALE_THRESHOLD_MINUTES = 15;
const OUTDATED_THRESHOLD_MINUTES = 24 * 60; // 24 hours

/**
 * Fetch GitHub repositories that need to be ingested
 *
 * Target repositories are:
 * - idle
 * - failed and retryAfter has passed
 * - running and updated more than 15 minutes ago (stale)
 * - completed and updated more than 24 hours ago (outdated)
 *
 * @returns Repositories to ingest
 */
export async function fetchIngestTargets(): Promise<TargetGitHubRepository[]> {
	// To prevent the race condition, consider running status as stale if it hasn't been updated for 15 minutes (> 800 seconds)
	const staleThreshold = new Date(
		Date.now() - STALE_THRESHOLD_MINUTES * 60 * 1000,
	);
	// To update repository which updated more than 24 hours ago
	const outdatedThreshold = new Date(
		Date.now() - OUTDATED_THRESHOLD_MINUTES * 60 * 1000,
	);
	// Current time for retryAfter comparison
	const now = new Date();

	const records = await db
		.select({
			dbId: githubRepositoryIndex.dbId,
			owner: githubRepositoryIndex.owner,
			repo: githubRepositoryIndex.repo,
			installationId: githubRepositoryIndex.installationId,
			lastIngestedCommitSha: githubRepositoryIndex.lastIngestedCommitSha,
			teamDbId: githubRepositoryIndex.teamDbId,
			status: githubRepositoryIndex.status,
		})
		.from(githubRepositoryIndex)
		.where(
			or(
				eq(githubRepositoryIndex.status, "idle"),
				and(
					eq(githubRepositoryIndex.status, "failed"),
					isNotNull(githubRepositoryIndex.retryAfter),
					lt(githubRepositoryIndex.retryAfter, now),
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
