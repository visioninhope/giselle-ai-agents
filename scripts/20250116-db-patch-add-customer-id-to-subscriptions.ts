import { db, subscriptions } from "@/drizzle";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
	throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2024-11-20.acacia",
});

async function updateSubscriptionCustomerId(
	sub: typeof subscriptions.$inferSelect,
) {
	try {
		// Get subscription from Stripe
		const stripeSubscription = await stripe.subscriptions.retrieve(sub.id);

		// Get customer_id from the subscription
		const customerId =
			typeof stripeSubscription.customer === "string"
				? stripeSubscription.customer
				: stripeSubscription.customer.id;

		// Update subscription in database
		await db
			.update(subscriptions)
			.set({ customerId })
			.where(eq(subscriptions.dbId, sub.dbId));

		console.log(
			`Updated subscription ${sub.id} with customer_id ${customerId}`,
		);
	} catch (error) {
		console.error(`Failed to update subscription ${sub.id}:`, error);
	}
}

async function main() {
	const subsWithoutCustomerId = await db.query.subscriptions.findMany({
		where: (subscriptions, { isNull }) => isNull(subscriptions.customerId),
	});

	console.log(
		`Found ${subsWithoutCustomerId.length} subscriptions without customer_id`,
	);

	await Promise.all(subsWithoutCustomerId.map(updateSubscriptionCustomerId));

	console.log("Successfully updated all subscriptions with customer_id");
}

main()
	.catch((error) => {
		console.error("Migration failed:", error);
		process.exit(1);
	})
	.finally(() => {
		process.exit(0);
	});
