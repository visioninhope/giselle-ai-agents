"use server";

import { getUser } from "@/lib/supabase";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { stripe } from "../config";
import { createOrRetrieveCustomer } from "./create-or-retrieve-customer";

export const createAndRedirectCheckoutSession = async () => {
	const user = await getUser();
	const customer = await createOrRetrieveCustomer(user);
	/** @todo remove type assertion */
	const origin: string = headers().get("origin") as string;
	const checkoutSession: Stripe.Checkout.Session =
		await stripe.checkout.sessions.create({
			mode: "subscription",
			line_items: [
				{
					price: "price_1Pvwvk2MBZMnjD8tWOMzkt4O",
					quantity: 1,
				},
			],
			customer,
			customer_update: {
				address: "auto",
			},
			success_url: `${origin}/dev/stripe/result?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}/dev/stripe`,
		});
	if (checkoutSession.url == null) {
		throw new Error("checkoutSession.url is null");
	}
	redirect(checkoutSession.url);
};
