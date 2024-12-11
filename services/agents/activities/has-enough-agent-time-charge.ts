import { db, subscriptions, teams } from "@/drizzle";
import { isProPlan } from "@/services/teams";
import { and, eq } from "drizzle-orm";
import { calculateAgentTimeUsageMs } from "./agent-time-usage";
import { AGENT_TIME_CHARGE_LIMIT_MINUTES } from "./constants";

export async function hasEnoughAgentTimeCharge(teamDbId: number) {
	const team = await getTeam(teamDbId);
	// if team is pro plan, go ahead
	if (isProPlan(team)) {
		return true;
	}

	// if team is free plan, check agent time usage
	const timeUsageMs = await calculateAgentTimeUsageMs(teamDbId);
	const limitsInMs = AGENT_TIME_CHARGE_LIMIT_MINUTES.FREE * 60 * 1000;
	if (timeUsageMs >= limitsInMs) {
		return false;
	}

	return true;
}

async function getTeam(teamDbId: number) {
	const result = await db
		.select({
			dbId: teams.dbId,
			name: teams.name,
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
		.where(eq(teams.dbId, teamDbId));
	if (result.length === 0) {
		throw new Error(`Team with dbId ${teamDbId} not found`);
	}
	return result[0];
}
