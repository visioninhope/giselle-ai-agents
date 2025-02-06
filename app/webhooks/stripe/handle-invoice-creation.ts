import { stripe } from "@/services/external/stripe";
import type Stripe from "stripe";

export async function handleInvoiceCreation(invoice: Stripe.Invoice) {
	if (!invoice.subscription || typeof invoice.subscription !== "string") {
		throw new Error(
			"Invoice is missing a subscription ID. Please check the invoice data.",
		);
	}

	const subscription = await stripe.subscriptions.retrieve(
		invoice.subscription,
	);

	if (subscription.status !== "canceled") {
		return;
	}

	await stripe.invoices.pay(invoice.id);
}
