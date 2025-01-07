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

	await finalizeAndPayInvoice(invoice.id);
}

async function finalizeAndPayInvoice(invoiceId: string) {
	try {
		await stripe.invoices.finalizeInvoice(invoiceId);
		await stripe.invoices.pay(invoiceId);
	} catch (error) {
		console.error(`Error processing invoice ${invoiceId}:`, error);
		throw new Error("Failed to process invoice");
	}
}
