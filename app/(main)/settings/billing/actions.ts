"use server";

import { db, stripeUserMappings, supabaseUserMappings } from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { stripe } from "@/services/external/stripe";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const redirectToPaymentPortal = async () => {
	const supabaseUser = await getUser();
	const [user] = await db
		.select({ stripeCustomerId: stripeUserMappings.stripeCustomerId })
		.from(stripeUserMappings)
		.innerJoin(
			supabaseUserMappings,
			eq(supabaseUserMappings.userDbId, stripeUserMappings.userDbId),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, supabaseUser.id));
	const session = await stripe.billingPortal.sessions.create({
		customer: user.stripeCustomerId,
		return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings/billing`,
	});
	redirect(session.url);
};
