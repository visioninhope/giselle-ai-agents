import { db } from "@/drizzle/db";
import { subscriptions, teamMemberships } from "@/drizzle/schema";
import { and, eq, ne } from "drizzle-orm";
import { stripe } from "../config";

export async function handleSubscriptionCancellation(subscriptionId: string) {
	const subscription = await stripe.subscriptions.retrieve(subscriptionId);

	if (subscription.status !== "canceled") {
		return;
	}

	// Get the team_db_id from subscriptions table
	const [sub] = await db
		.select({ teamDbId: subscriptions.teamDbId })
		.from(subscriptions)
		.where(eq(subscriptions.id, subscriptionId))
		.limit(1);

	if (!sub) {
		throw new Error(
			`Subscription record not found in database: ${subscriptionId}`,
		);
	}

	// Get the earliest admin's membership ID
	const [earliestAdmin] = await db
		.select({ id: teamMemberships.id })
		.from(teamMemberships)
		.where(
			and(
				eq(teamMemberships.teamDbId, sub.teamDbId),
				eq(teamMemberships.role, "admin"),
			),
		)
		.orderBy(teamMemberships.id)
		.limit(1);

	if (!earliestAdmin) {
		throw new Error(`No admin found for team (id: ${sub.teamDbId})`);
	}

	// Delete all team memberships except the earliest admin
	await db
		.delete(teamMemberships)
		.where(
			and(
				eq(teamMemberships.teamDbId, sub.teamDbId),
				ne(teamMemberships.id, earliestAdmin.id),
			),
		);
}
