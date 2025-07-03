import { agents, db, subscriptions, teams } from "@/drizzle";
import type { GitHubQueryContext } from "@giselle-sdk/giselle-engine";
import type { TelemetrySettings } from "ai";
import { and, eq } from "drizzle-orm";

/**
 * Create telemetry settings for GitHub query operations
 * @param context The GitHub query context containing workspaceId and repository info
 * @returns TelemetrySettings with team and operation metadata
 */
export async function createQueryTelemetrySettings(
	context: GitHubQueryContext,
): Promise<TelemetrySettings | undefined> {
	const { workspaceId, owner, repo } = context;

	// Look up team from workspace
	const teamRecords = await db
		.select({
			teamDbId: teams.dbId,
			teamType: teams.type,
			activeSubscriptionId: subscriptions.id,
		})
		.from(teams)
		.innerJoin(agents, eq(agents.teamDbId, teams.dbId))
		.leftJoin(
			subscriptions,
			and(
				eq(subscriptions.teamDbId, teams.dbId),
				eq(subscriptions.status, "active"),
			),
		)
		.where(eq(agents.workspaceId, workspaceId))
		.limit(1);

	if (teamRecords.length === 0) {
		return undefined;
	}

	const team = teamRecords[0];

	return {
		metadata: {
			teamDbId: team.teamDbId,
			teamType: team.teamType,
			isProPlan:
				team.activeSubscriptionId != null || team.teamType === "internal",
			subscriptionId: team.activeSubscriptionId ?? "",
			repository: `${owner}/${repo}`,
			workspaceId,
			operation: "github-repository-query",
			tags: ["auto-instrumented", "embedding", "github-query"],
		},
	};
}
