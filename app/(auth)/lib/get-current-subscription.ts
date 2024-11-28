"use server";

import { db, supabaseUserMappings, teamMemberships, teams } from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { eq } from "drizzle-orm";

export const getUserTeamId = async () => {
	const user = await getUser();
	// TODO: When team plans are released, a user may belong to multiple teams, so we need to handle that case.
	// e.g., fetch team id through agents or so.
	const [team] = await db
		.select({ teamId: teams.dbId })
		.from(teams)
		.innerJoin(teamMemberships, eq(teamMemberships.teamDbId, teams.dbId))
		.innerJoin(
			supabaseUserMappings,
			eq(supabaseUserMappings.userDbId, teamMemberships.userDbId),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, user.id));

	return team.teamId;
};
