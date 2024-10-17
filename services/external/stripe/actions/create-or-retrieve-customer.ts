"use server";

import {
	type UserId,
	db,
	stripeUserMappings,
	supabaseUserMappings,
	users,
} from "@/drizzle";
import { eq } from "drizzle-orm";
import { stripe } from "../config";

export const createOrRetrieveCustomer = async (
	userId: UserId,
	userEmail: string,
) => {
	const [stripeUserMapping] = await db
		.select({ stripeCustomerId: stripeUserMappings.stripeCustomerId })
		.from(stripeUserMappings)
		.innerJoin(users, eq(users.dbId, stripeUserMappings.userDbId))
		.where(eq(users.id, userId));
	if (stripeUserMapping != null) {
		return stripeUserMapping.stripeCustomerId;
	}
	const newCustomer = await createCustomer(userId, userEmail);
	const [dbUser] = await db
		.select({
			dbId: users.dbId,
		})
		.from(users)
		.where(eq(users.id, userId));
	await db.insert(stripeUserMappings).values({
		userDbId: dbUser.dbId,
		stripeCustomerId: newCustomer.id,
	});
	return newCustomer.id;
};

const createCustomer = async (userId: UserId, userEmail: string) => {
	const newCustomer = await stripe.customers.create({
		email: userEmail,
		metadata: { userId },
	});
	if (!newCustomer) throw new Error("Stripe customer creation failed.");

	return newCustomer;
};
