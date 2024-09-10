import { retrieveStripeSubscriptionBySupabaseUserId } from "@/services/accounts/actions";
import { createCheckoutBySupabaseUser } from "@/services/external/stripe/actions";
import { NextResponse } from "next/server";
import { supabaseMiddleware } from "./lib/supabase";

export default supabaseMiddleware(async (user, request) => {
	if (user == null) {
		// no user, potentially respond by redirecting the user to the login page
		const url = request.nextUrl.clone();
		url.pathname = "/login";
		return NextResponse.redirect(url);
	}
	const subscription = await retrieveStripeSubscriptionBySupabaseUserId(
		user.id,
	);
	if (subscription == null) {
		const checkout = await createCheckoutBySupabaseUser(user);
		return NextResponse.redirect(checkout.url as string);
	}
	/** @todo Validate subscription status */
});

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|dev|webhooks|login|signup|pricing|password_reset|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
