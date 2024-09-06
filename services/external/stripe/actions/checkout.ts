"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
	// https://github.com/stripe/stripe-node#configuration
	apiVersion: "2024-06-20",
});

export const createAndRedirectCheckoutSession = async () => {
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
			success_url: `${origin}/dev/stripe/result?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}/dev/stripe`,
		});
	if (checkoutSession.url == null) {
		throw new Error("checkoutSession.url is null");
	}
	redirect(checkoutSession.url);
};

//  const checkoutSession: Stripe.Checkout.Session =
//     await stripe.checkout.sessions.create({
//       mode: "payment",
//       submit_type: "donate",
//       line_items: [
//         {
//           quantity: 1,
//           price_data: {
//             currency: CURRENCY,
//             product_data: {
//               name: "Custom amount donation",
//             },
//             unit_amount: formatAmountForStripe(
//               Number(data.get("customDonation") as string),
//               CURRENCY,
//             ),
//           },
//         },
//       ],
//       ...(ui_mode === "hosted" && {
//         success_url: `${origin}/donate-with-checkout/result?session_id={CHECKOUT_SESSION_ID}`,
//         cancel_url: `${origin}/donate-with-checkout`,
//       }),
//       ...(ui_mode === "embedded" && {
//         return_url: `${origin}/donate-with-embedded-checkout/result?session_id={CHECKOUT_SESSION_ID}`,
//       }),
//       ui_mode,
//     });

//   return {
//     client_secret: checkoutSession.client_secret,
//     url: checkoutSession.url,
//   };
// }
