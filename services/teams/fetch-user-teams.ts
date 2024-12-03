import { db, supabaseUserMappings, teamMemberships, teams } from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { eq } from "drizzle-orm";

/**
 * fetch teams for the current user
 */
export async function fetchUserTeams() {
	const user = await getUser();
	const records = await db
		.select({
			dbId: teams.dbId,
			name: teams.name,
		})
		.from(teams)
		.innerJoin(teamMemberships, eq(teams.dbId, teamMemberships.teamDbId))
		.innerJoin(
			supabaseUserMappings,
			eq(teamMemberships.userDbId, supabaseUserMappings.userDbId),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, user.id));
	if (records.length === 0) {
		throw new Error("User does not have a team");
	}
	return records;
}
