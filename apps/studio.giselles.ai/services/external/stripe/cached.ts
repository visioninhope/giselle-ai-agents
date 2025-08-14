import { getCache } from "@vercel/functions";
import type Stripe from "stripe";
import { stripe } from "./config";

/**
 * Retrieve a Stripe Price with a Runtime Cache layer.
 * - Uses Vercel Runtime Cache API when available.
 * - Falls back to direct Stripe API if cache is unavailable.
 */
export async function getCachedPrice(priceId: string): Promise<Stripe.Price> {
	const cacheKey = `stripe:price:${priceId}`;

	// Vercel Runtime Cache via @vercel/functions
	const cache = getCache();
	const cached = await cache.get(cacheKey);
	if (cached) {
		return cached as Stripe.Price;
	}

	// Fetch fresh data from Stripe
	const price = await stripe.prices.retrieve(priceId);

	// Populate cache (best-effort) using @vercel/functions only
	await cache.set(cacheKey, price, {
		ttl: 3600,
		tags: ["stripe:price", `stripe:price:${priceId}`],
	});

	return price;
}
