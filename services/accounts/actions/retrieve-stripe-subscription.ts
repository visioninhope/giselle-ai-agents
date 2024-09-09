import {
	db,
	organizations,
	stripeUserMappings,
	subscriptions,
	supabaseUserMappings,
	teamMemberships,
	teams,
	users,
} from "@/drizzle";
import { stripe } from "@/services/external/stripe";
import { eq } from "drizzle-orm";

export const retrieveStripeSubscriptionBySupabaseUserId = async (
	supabaseUserId: string,
) => {
	const [subscription] = await db
		.selectDistinct({ id: subscriptions.id })
		.from(subscriptions)
		.innerJoin(
			organizations,
			eq(organizations.dbId, subscriptions.organizationDbId),
		)
		.innerJoin(teams, eq(teams.organizationDbId, organizations.dbId))
		.innerJoin(teamMemberships, eq(teamMemberships.teamDbId, teams.dbId))
		.innerJoin(users, eq(users.dbId, teamMemberships.userDbId))
		.innerJoin(
			supabaseUserMappings,
			eq(supabaseUserMappings.userDbId, users.dbId),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, supabaseUserId));
	if (subscription == null) {
		return null;
	}
	return await stripe.subscriptions.retrieve(subscription.id);
};
