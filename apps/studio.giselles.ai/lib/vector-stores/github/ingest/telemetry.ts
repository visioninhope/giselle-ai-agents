import type { TelemetrySettings } from "ai";
import { and, eq } from "drizzle-orm";
import { db, subscriptions, teams } from "@/drizzle";
import { isProPlan } from "@/services/teams";

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
	const result = await db
		.select({
			id: teams.id,
			dbId: teams.dbId,
			type: teams.type,
			name: teams.name,
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

	if (result.length === 0) {
		return undefined;
	}

	const teamInfo = result[0];

	return {
		isEnabled: true,
		metadata: {
			teamDbId: teamInfo.dbId, // userId is not available in ingest context, instead we add teamDbId
			teamType: teamInfo.type,
			isProPlan: isProPlan(teamInfo),
			subscriptionId: teamInfo.activeSubscriptionId ?? "",
			repository,
			tags: ["auto-instrumented", "embedding", "github-ingest"],
		},
	};
}
