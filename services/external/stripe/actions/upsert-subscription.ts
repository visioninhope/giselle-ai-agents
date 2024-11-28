import {
	db,
	stripeUserMappings,
	subscriptions,
	teamMemberships,
	teams,
	users,
} from "@/drizzle";
import { eq } from "drizzle-orm";
import { stripe } from "../config";

const timestampToDateTime = (timestamp: number) => new Date(timestamp * 1000);

export const upsertSubscription = async (
	subscriptionId: string,
	customerId: string,
) => {
	const subscription = await stripe.subscriptions.retrieve(subscriptionId);

	// TODO: When team plans are released, a user may belong to multiple teams, so we need to handle that case.
	const [team] = await db
		.select({ dbId: teams.dbId })
		.from(teams)
		.innerJoin(teams, eq(teams.dbId, subscriptions.teamDbId))
		.innerJoin(teamMemberships, eq(teamMemberships.teamDbId, teams.dbId))
		.innerJoin(users, eq(users.dbId, teamMemberships.userDbId))
		.innerJoin(stripeUserMappings, eq(stripeUserMappings.userDbId, users.dbId))
		.where(eq(stripeUserMappings.stripeCustomerId, customerId));

	const upsertValues: typeof subscriptions.$inferInsert = {
		id: subscription.id,
		teamDbId: team.dbId,
		status: subscription.status,
		cancelAtPeriodEnd: subscription.cancel_at_period_end,
		cancelAt:
			subscription.cancel_at !== null
				? timestampToDateTime(subscription.cancel_at)
				: null,
		canceledAt:
			subscription.canceled_at !== null
				? timestampToDateTime(subscription.canceled_at)
				: null,
		currentPeriodStart: timestampToDateTime(subscription.current_period_start),
		currentPeriodEnd: timestampToDateTime(subscription.current_period_end),
		created: timestampToDateTime(subscription.created),
		endedAt:
			subscription.ended_at !== null
				? timestampToDateTime(subscription.ended_at)
				: null,
		trialStart:
			subscription.trial_start !== null
				? timestampToDateTime(subscription.trial_start)
				: null,
		trialEnd:
			subscription.trial_end !== null
				? timestampToDateTime(subscription.trial_end)
				: null,
	};
	await db.insert(subscriptions).values(upsertValues).onConflictDoUpdate({
		target: subscriptions.id,
		set: upsertValues,
	});
};
