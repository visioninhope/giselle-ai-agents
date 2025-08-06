import { stripe } from "@/services/external/stripe";
import { reportUserSeatUsage } from "@/services/usage-based-billing";
import type { CurrentTeam } from "./types";

/**
 * Handle team member changes for usage-based billing.
 * Reports user seat usage to Stripe when team membership changes.
 */
export async function handleMemberChange(currentTeam: CurrentTeam) {
	const subscriptionId = currentTeam.activeSubscriptionId;
	if (subscriptionId == null) {
		// No active subscription, nothing to do
		return;
	}

	// FIXME: If we have customer in subscriptions table, we don't have to query to Stripe here.
	const subscription = await stripe.subscriptions.retrieve(subscriptionId);
	const customer =
		typeof subscription.customer === "string"
			? subscription.customer
			: subscription.customer.id;
	await reportUserSeatUsage(subscriptionId, customer);
}
