"use server";

import {
	db,
	subscriptions,
	supabaseUserMappings,
	teamMemberships,
	teams,
} from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { eq } from "drizzle-orm";

export const getUserSubscriptionId = async () => {
	const user = await getUser();
	// TODO: When team plans are released, a user may belong to multiple teams, so we need to handle that case.
	// e.g., fetch team id through agents or so.
	const [subscription] = await db
		.select({ id: subscriptions.dbId })
		.from(subscriptions)
		.innerJoin(teams, eq(teams.dbId, subscriptions.teamDbId))
		.innerJoin(teamMemberships, eq(teamMemberships.teamDbId, teams.dbId))
		.innerJoin(
			supabaseUserMappings,
			eq(supabaseUserMappings.userDbId, teamMemberships.userDbId),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, user.id));

	return subscription?.id ?? "sub_hotfix";
};
