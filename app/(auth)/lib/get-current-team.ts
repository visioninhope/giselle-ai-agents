"use server";

import { db, supabaseUserMappings, teamMemberships, teams } from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { eq } from "drizzle-orm";

export const getCurrentTeam = async () => {
	const user = await getUser();
	const [team] = await db
		.select({
			id: teams.dbId,
		})
		.from(teams)
		.innerJoin(teamMemberships, eq(teamMemberships.teamDbId, teams.dbId))
		.innerJoin(
			supabaseUserMappings,
			eq(supabaseUserMappings.userDbId, teamMemberships.userDbId),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, user.id));
	return team;
};
