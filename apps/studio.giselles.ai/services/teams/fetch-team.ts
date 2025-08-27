import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle";
import { subscriptions, teams } from "@/drizzle/schema";
import type { TeamId, TeamWithSubscription } from "./types";

export async function fetchTeamById(
	teamId: TeamId,
): Promise<TeamWithSubscription | null> {
	const result = await db
		.select({
			id: teams.id,
			dbId: teams.dbId,
			name: teams.name,
			avatarUrl: teams.avatarUrl,
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
		.where(eq(teams.id, teamId));
	if (result.length === 0) {
		return null;
	}
	return result[0];
}

export async function fetchTeamByDbId(
	dbId: number,
): Promise<TeamWithSubscription | null> {
	const result = await db
		.select({
			id: teams.id,
			dbId: teams.dbId,
			name: teams.name,
			avatarUrl: teams.avatarUrl,
			type: teams.type,
			activeSubscriptionId: subscriptions.id,
		})
		.from(teams)
		.where(eq(teams.dbId, dbId))
		.leftJoin(
			subscriptions,
			and(
				eq(subscriptions.teamDbId, teams.dbId),
				eq(subscriptions.status, "active"),
			),
		);

	if (result.length === 0) {
		return null;
	}
	return result[0];
}
