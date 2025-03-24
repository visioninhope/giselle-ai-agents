import type { UsageLimits } from "@giselle-sdk/usage-limits";
import { Tier } from "giselle-sdk";
import {
	AGENT_TIME_CHARGE_LIMIT_MINUTES,
	calculateAgentTimeUsageMs,
} from "../../services/agents/activities";
import {
	type CurrentTeam,
	type TeamId,
	isProPlan,
	isTeamId,
} from "../../services/teams";

export async function getUsageLimitsForTeam(
	team: CurrentTeam,
): Promise<UsageLimits> {
	const featureTier = isProPlan(team) ? Tier.enum.pro : Tier.enum.free;
	const agentTimeUsage = await calculateAgentTimeUsageMs(team.dbId);
	const agentTimeLimitValue = agentTimeLimit(team);

	return {
		featureTier,
		resourceLimits: {
			agentTime: {
				limit: agentTimeLimitValue,
				used: agentTimeUsage,
			},
		},
	};
}

function agentTimeLimit(team: CurrentTeam): number {
	const restrictedTeamIds = process.env.MODEL_USAGE_RESTRICTED_TEAM_IDS?.split(
		",",
	)
		.map((teamId) => (isTeamId(teamId) ? teamId : null))
		.filter((teamId): teamId is TeamId => teamId !== null);

	if (restrictedTeamIds?.includes(team.id)) {
		return 0; // restricted teams should not be able to use agent time
	}

	if (isProPlan(team)) {
		return Number.POSITIVE_INFINITY; // pro plan has no limit
	}

	return AGENT_TIME_CHARGE_LIMIT_MINUTES.FREE * 60 * 1000;
}
