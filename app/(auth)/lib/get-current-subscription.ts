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
import { unstable_cache } from "next/cache";

export const getUserSubscriptionId = unstable_cache(
	async () => {
		const user = await getUser();
		const [subscription] = await db
			.select({
				organizationId: organizations.id, // todo: replace with 'subscriptionId' if subscriptions table is created in the future
			})
			.from(organizations)
			.innerJoin(teams, eq(teams.organizationId, organizations.id))
			.innerJoin(teamMemberships, eq(teamMemberships.teamId, teams.id))
			.innerJoin(
				supabaseUserMappings,
				eq(supabaseUserMappings.userId, teamMemberships.userId),
			)
			.where(eq(supabaseUserMappings.supabaseUserId, user.id));
		return subscription.organizationId;
	}
);
