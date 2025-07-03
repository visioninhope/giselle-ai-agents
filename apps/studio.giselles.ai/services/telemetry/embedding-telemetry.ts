import { agents, db, subscriptions, teams } from "@/drizzle";
import type { WorkspaceId } from "@giselle-sdk/data-type";
import type { TelemetrySettings } from "ai";
import { and, eq } from "drizzle-orm";

type EmbeddingTelemetryContext =
	| {
			operation: "github-repository-ingest";
			teamDbId: number;
			repository: string;
	  }
	| {
			operation: "github-repository-query";
			workspaceId: WorkspaceId;
			repository: string;
	  };

/**
 * Create telemetry settings for embedding operations
 * Handles both ingest and query operations with proper team/subscription metadata
 */
export async function createEmbeddingTelemetrySettings(
	context: EmbeddingTelemetryContext,
	isEnabled = true,
): Promise<TelemetrySettings | undefined> {
	let teamDbId: number;

	// Resolve teamDbId based on the operation type
	if (context.operation === "github-repository-ingest") {
		teamDbId = context.teamDbId;
	} else {
		// For query operations, look up teamDbId from workspaceId
		const teamRecords = await db
			.select({ dbId: teams.dbId })
			.from(teams)
			.innerJoin(agents, eq(agents.teamDbId, teams.dbId))
			.where(eq(agents.workspaceId, context.workspaceId))
			.limit(1);

		if (teamRecords.length === 0) {
			return undefined;
		}
		teamDbId = teamRecords[0].dbId;
	}

	// Get team information with subscription
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

	const metadata: Record<string, unknown> = {
		teamDbId,
		teamType: teamInfo[0].type,
		isProPlan:
			teamInfo[0].activeSubscriptionId != null ||
			teamInfo[0].type === "internal",
		subscriptionId: teamInfo[0].activeSubscriptionId ?? "",
		repository: context.repository,
		operation: context.operation,
		tags: [
			"auto-instrumented",
			"embedding",
			context.operation === "github-repository-ingest"
				? "github-ingest"
				: "github-query",
		],
	};

	// Add workspaceId for query operations
	if (context.operation === "github-repository-query") {
		metadata.workspaceId = context.workspaceId;
	}

	// Note: userId is not available in cron job context for ingest operations

	return {
		isEnabled,
		metadata,
	};
}
