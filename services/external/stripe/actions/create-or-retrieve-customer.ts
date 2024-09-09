"use server";

import { db, stripeUserMappings, supabaseUserMappings, users } from "@/drizzle";
import type { User } from "@supabase/auth-js";
import { eq } from "drizzle-orm";
import { stripe } from "../config";

export const createOrRetrieveCustomer = async (user: User) => {
	const [stripeUserMapping] = await db
		.select({ stripeCustomerId: stripeUserMappings.stripeCustomerId })
		.from(stripeUserMappings)
		.innerJoin(
			supabaseUserMappings,
			eq(supabaseUserMappings.userDbId, stripeUserMappings.userDbId),
		);
	if (stripeUserMapping != null) {
		return stripeUserMapping.stripeCustomerId;
	}
	const newCustomer = await createCustomer(user);
	const [dbUser] = await db
		.select({
			dbId: users.dbId,
		})
		.from(users)
		.innerJoin(
			supabaseUserMappings,
			eq(users.dbId, supabaseUserMappings.userDbId),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, user.id));
	await db.insert(stripeUserMappings).values({
		userDbId: dbUser.dbId,
		stripeCustomerId: newCustomer.id,
	});
};

const createCustomer = async (user: User) => {
	const customerData = {
		metadata: { supabaseUUID: user.id },
		email: user.email,
	};
	const newCustomer = await stripe.customers.create(customerData);
	if (!newCustomer) throw new Error("Stripe customer creation failed.");

	return newCustomer;
};
