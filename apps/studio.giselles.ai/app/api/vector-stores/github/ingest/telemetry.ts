import { db, subscriptions, teams } from "@/drizzle";
import type { TelemetrySettings } from "ai";
import { and, eq } from "drizzle-orm";

/**
 * Create telemetry settings for GitHub repository ingestion
 * @param teamDbId The database ID of the team
 * @param repository The repository being ingested (owner/repo format)
 * @returns TelemetrySettings with team and operation metadata
 */
export async function createIngestTelemetrySettings(
	teamDbId: number,
	repository: string,
): Promise<TelemetrySettings | undefined> {
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

	if (!teamInfo[0]) {
		return undefined;
	}

	return {
		metadata: {
			teamDbId,
			teamType: teamInfo[0].type,
			isProPlan:
				teamInfo[0].activeSubscriptionId != null ||
				teamInfo[0].type === "internal",
			subscriptionId: teamInfo[0].activeSubscriptionId ?? "",
			repository,
			// Note: userId is not available in cron job context
			// This is a system-initiated operation
			operation: "github-repository-ingest",
			tags: ["auto-instrumented", "embedding", "github-ingest"],
		},
	};
}
