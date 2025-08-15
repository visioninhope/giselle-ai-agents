import { getCache } from "@vercel/functions";
import type Stripe from "stripe";
import { stripe } from "./config";

// Promise cache to prevent duplicate concurrent API calls
const inFlightPromises = new Map<string, Promise<Stripe.Price>>();

/**
 * Retrieve a Stripe Price with a Runtime Cache layer.
 * - Uses Vercel Runtime Cache API when available.
 * - Falls back to direct Stripe API if cache is unavailable.
 */
export function getCachedPrice(priceId: string): Promise<Stripe.Price> {
	const inFlight = inFlightPromises.get(priceId);
	if (inFlight) {
		return inFlight;
	}

	const fetchPromise = (async () => {
		try {
			const cacheKey = `stripe:price:${priceId}`;
			const cache = getCache();
			const cached = await cache.get(cacheKey);
			if (cached) {
				return cached as Stripe.Price;
			}

			const price = await stripe.prices.retrieve(priceId);
			await cache.set(cacheKey, price, {
				ttl: 3600,
				tags: ["stripe:price", `stripe:price:${priceId}`],
			});
			return price;
		} finally {
			inFlightPromises.delete(priceId);
		}
	})();
	inFlightPromises.set(priceId, fetchPromise);

	return fetchPromise;
}
