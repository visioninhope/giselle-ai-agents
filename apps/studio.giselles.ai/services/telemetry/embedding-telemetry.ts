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

interface TeamTelemetryInfo {
	teamDbId: number;
	workspaceId?: WorkspaceId | null;
	teamType: string;
	activeSubscriptionId: string | null;
}

/**
 * Resolve team telemetry info from teamDbId (used for ingest operations)
 */
async function resolveTeamTelemetryInfoByTeamId(
	teamDbId: number,
): Promise<TeamTelemetryInfo | undefined> {
	const result = await db
		.select({
			teamDbId: teams.dbId,
			teamType: teams.type,
			activeSubscriptionId: subscriptions.id,
			workspaceId: agents.workspaceId,
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
		.where(eq(teams.dbId, teamDbId))
		.limit(1);

	if (result.length === 0) {
		return undefined;
	}

	return {
		teamDbId: result[0].teamDbId,
		workspaceId: result[0].workspaceId,
		teamType: result[0].teamType,
		activeSubscriptionId: result[0].activeSubscriptionId,
	};
}

/**
 * Resolve team telemetry info from workspaceId (used for query operations)
 */
async function resolveTeamTelemetryInfoByWorkspaceId(
	workspaceId: WorkspaceId,
): Promise<TeamTelemetryInfo | undefined> {
	const result = await db
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

	if (result.length === 0) {
		return undefined;
	}

	return {
		teamDbId: result[0].teamDbId,
		workspaceId: workspaceId,
		teamType: result[0].teamType,
		activeSubscriptionId: result[0].activeSubscriptionId,
	};
}

/**
 * Create telemetry settings for embedding operations
 * Handles both ingest and query operations with proper team/subscription metadata
 */
export async function createEmbeddingTelemetrySettings(
	context: EmbeddingTelemetryContext,
	isEnabled = true,
): Promise<TelemetrySettings | undefined> {
	const teamInfo =
		context.operation === "github-repository-ingest"
			? await resolveTeamTelemetryInfoByTeamId(context.teamDbId)
			: await resolveTeamTelemetryInfoByWorkspaceId(context.workspaceId);

	if (!teamInfo) {
		return undefined;
	}

	const metadata: TelemetrySettings["metadata"] = {
		teamDbId: teamInfo.teamDbId,
		teamType: teamInfo.teamType,
		isProPlan:
			teamInfo.activeSubscriptionId != null || teamInfo.teamType === "internal",
		subscriptionId: teamInfo.activeSubscriptionId ?? "",
		workspaceId: teamInfo.workspaceId ?? "",
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

	// Note: userId is not available in cron job context for ingest operations

	return {
		isEnabled,
		metadata,
	};
}
