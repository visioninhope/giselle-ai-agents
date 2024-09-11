import { stripe } from "@/services/external/stripe";
import { upsertSubscription } from "@/services/external/stripe/actions";
import type Stripe from "stripe";

const relevantEvents = new Set([
	// "product.created",
	// "product.updated",
	// "product.deleted",
	// "price.created",
	// "price.updated",
	// "price.deleted",
	"checkout.session.completed",
	"customer.subscription.created",
	"customer.subscription.updated",
	"customer.subscription.deleted",
]);

export async function POST(req: Request) {
	const body = await req.text();
	const sig = req.headers.get("stripe-signature") as string;
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
	let event: Stripe.Event;

	try {
		if (!sig || !webhookSecret)
			return new Response("Webhook secret not found.", { status: 400 });
		event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
		console.log(`🔔  Webhook received: ${event.type}`);

		// biome-ignore lint: lint/suspicious/noExplicitAny: @todo error handling
	} catch (err: any) {
		console.log(`❌ Error message: ${err.message}`);
		return new Response(`Webhook Error: ${err.message}`, { status: 400 });
	}

	if (relevantEvents.has(event.type)) {
		try {
			switch (event.type) {
				// case "product.created":
				// case "product.updated":
				// 	await upsertProductRecord(event.data.object as Stripe.Product);
				// 	break;
				// case "price.created":
				// case "price.updated":
				// 	await upsertPriceRecord(event.data.object as Stripe.Price);
				// 	break;
				// case "price.deleted":
				// 	await deletePriceRecord(event.data.object as Stripe.Price);
				// 	break;
				// case "product.deleted":
				// 	await deleteProductRecord(event.data.object as Stripe.Product);
				// 	break;
				case "customer.subscription.created":
				case "customer.subscription.updated":
				case "customer.subscription.deleted":
					if (
						event.data.object.customer == null ||
						typeof event.data.object.customer !== "string"
					) {
						throw new Error(
							"The checkout session is missing a valid customer ID. Please check the session data.",
						);
					}
					await upsertSubscription(
						event.data.object.id,
						event.data.object.customer,
					);
					break;
				case "checkout.session.completed":
					if (event.data.object.mode !== "subscription") {
						throw new Error("Unhandled relevant event!");
					}
					if (
						event.data.object.subscription == null ||
						typeof event.data.object.subscription !== "string"
					) {
						throw new Error(
							"The checkout session is missing a valid subscription ID. Please check the session data.",
						);
					}
					if (
						event.data.object.customer == null ||
						typeof event.data.object.customer !== "string"
					) {
						throw new Error(
							"The checkout session is missing a valid customer ID. Please check the session data.",
						);
					}
					await upsertSubscription(
						event.data.object.subscription,
						event.data.object.customer,
					);
					break;
				default:
					throw new Error("Unhandled relevant event!");
			}
		} catch (error) {
			console.log(error);
			return new Response(
				"Webhook handler failed. View your Next.js function logs.",
				{
					status: 400,
				},
			);
		}
	} else {
		return new Response(`Unsupported event type: ${event.type}`, {
			status: 400,
		});
	}
	return new Response(JSON.stringify({ received: true }));
}
