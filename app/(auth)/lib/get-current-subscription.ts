"use server";

import {
	db,
	organizations,
	supabaseUserMappings,
	teamMemberships,
	teams,
} from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { eq } from "drizzle-orm";

export const getUserSubscriptionId = async () => {
	const user = await getUser();
	const [subscription] = await db
		.select({
			organizationId: organizations.dbId, // todo: replace with 'subscriptionId' if subscriptions table is created in the future
		})
		.from(organizations)
		.innerJoin(teams, eq(teams.organizationDbId, organizations.dbId))
		.innerJoin(teamMemberships, eq(teamMemberships.teamDbId, teams.dbId))
		.innerJoin(
			supabaseUserMappings,
			eq(supabaseUserMappings.userDbId, teamMemberships.userDbId),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, user.id));
	return subscription.organizationId;
};
