import { db, subscriptions, teams } from "@/drizzle";
import {
	DRAFT_TEAM_NAME_METADATA_KEY,
	DRAFT_TEAM_USER_DB_ID_METADATA_KEY,
} from "@/services/teams/constants";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { stripe } from "../config";

const timestampToDateTime = (timestamp: number) => new Date(timestamp * 1000);

export const upsertSubscription = async (subscriptionId: string) => {
	const subscription = await stripe.subscriptions.retrieve(subscriptionId);
	const existingSubscriptionRecord = await db
		.select()
		.from(subscriptions)
		.where(eq(subscriptions.id, subscription.id));

	if (existingSubscriptionRecord.length > 0) {
		await updateSubscription(subscription);
		return;
	}

	await activateProTeamSubscription(subscription);
};

async function activateProTeamSubscription(subscription: Stripe.Subscription) {
	// TODO: handle the case of upgrading.
	if (
		!(DRAFT_TEAM_NAME_METADATA_KEY in subscription.metadata) ||
		!(DRAFT_TEAM_USER_DB_ID_METADATA_KEY in subscription.metadata)
	) {
		throw new Error(
			"Draft team information is not found in subscription metadata",
		);
	}

	const userDbId = Number.parseInt(
		subscription.metadata[DRAFT_TEAM_USER_DB_ID_METADATA_KEY],
		10,
	);
	const teamName = subscription.metadata[DRAFT_TEAM_NAME_METADATA_KEY];
	const teamDbId = await createTeam(userDbId, teamName);
	await insertSubscription(subscription, teamDbId);
}

async function createTeam(userDbId: number, teamName: string) {
	const teamDbId = await db.transaction(async (tx) => {
		const [team] = await db
			.insert(teams)
			.values({
				name: teamName,
				isInternalTeam: false,
			})
			.returning({ dbid: teams.dbId });
		return team.dbid;
	});

	return teamDbId;
}

async function insertSubscription(
	subscription: Stripe.Subscription,
	teamDbId: number,
) {
	await db.insert(subscriptions).values({
		id: subscription.id,
		teamDbId: teamDbId,
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
	});
}

async function updateSubscription(subscription: Stripe.Subscription) {
	await db
		.update(subscriptions)
		.set({
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
			currentPeriodStart: timestampToDateTime(
				subscription.current_period_start,
			),
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
		})
		.where(eq(subscriptions.id, subscription.id));
}
