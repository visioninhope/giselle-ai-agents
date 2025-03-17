import { db, subscriptions } from "@/drizzle";
import { eq } from "drizzle-orm";
import { Tier } from "giselle-sdk";
import {
	AGENT_TIME_CHARGE_LIMIT_MINUTES,
	calculateAgentTimeUsageMs,
	getCurrentBillingPeriod,
} from "../../services/agents/activities";
import { type CurrentTeam, isProPlan } from "../../services/teams";

export async function subscriptionFrom(
	team: CurrentTeam,
): Promise<Subscription> {
	const planName = isProPlan(team) ? "Pro" : "Free";
	const { end: currentPeriodEndDate } = await getCurrentBillingPeriod(
		team.dbId,
	);
	let isExpiring = false;
	const languageModelTier = isProPlan(team) ? Tier.enum.pro : Tier.enum.free;
	if (team.activeSubscriptionId != null) {
		const subscription = await db
			.select({ cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd })
			.from(subscriptions)
			.where(eq(subscriptions.id, team.activeSubscriptionId))
			.limit(1);
		if (subscription.length === 0) {
			throw new Error(`Subscription not found: ${team.activeSubscriptionId}`);
		}
		isExpiring = subscription[0].cancelAtPeriodEnd;
	}
	const agentTimeUsage = await calculateAgentTimeUsageMs(team.dbId);
	const agentTimeLimit = isProPlan(team)
		? AGENT_TIME_CHARGE_LIMIT_MINUTES.PRO * 60 * 1000
		: AGENT_TIME_CHARGE_LIMIT_MINUTES.FREE * 60 * 1000;
	const detailPath = "/settings/team";

	return {
		planName,
		currentPeriodEndDate,
		isExpiring,
		languageModelTier,
		detailPath,
		agentTime: {
			limit: agentTimeLimit,
			used: agentTimeUsage,
		},
	};
}

// Subscription type on studio.giselles.ai domain
type Subscription = {
	planName: "Free" | "Pro";
	currentPeriodEndDate: Date;
	isExpiring: boolean;
	languageModelTier: Tier;
	detailPath: string;
	agentTime: {
		limit: number; // in milliseconds
		used: number; // in milliseconds
	};
};
