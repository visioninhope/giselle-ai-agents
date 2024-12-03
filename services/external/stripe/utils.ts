import type Stripe from "stripe";

export function formatStripePrice(price: Stripe.Price): string {
	if (!price.unit_amount) return "Free";

	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: price.currency,
		minimumFractionDigits: 0,
	}).format(price.unit_amount / 100);
}
