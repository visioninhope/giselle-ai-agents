import { db, supabaseUserMappings, teamMemberships, teams } from "@/drizzle";
import { getGiselleSession } from "@/lib/giselle-session";
import { getUser } from "@/lib/supabase";
import { and, asc, eq } from "drizzle-orm";

export async function fetchCurrentTeam() {
	const supabaseUser = await getUser();
	const session = await getGiselleSession();
	const teamDbId = session.teamDbId;

	if (teamDbId == null) {
		// if the user does not have a teamDbId in their session, return the first team
		const team = await db
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
			.where(eq(supabaseUserMappings.supabaseUserId, supabaseUser.id))
			.orderBy(asc(teams.dbId))
			.limit(1);
		if (team.length === 0) {
			throw new Error("User does not have a team");
		}
		return team[0];
	}

	const team = await db
		.select({
			dbId: teams.dbId,
			name: teams.name,
		})
		.from(teams)
		// join teamMemberships and supabaseUserMappings to check user's membership
		.innerJoin(teamMemberships, eq(teams.dbId, teamMemberships.teamDbId))
		.innerJoin(
			supabaseUserMappings,
			eq(teamMemberships.userDbId, supabaseUserMappings.userDbId),
		)
		.where(
			and(
				eq(supabaseUserMappings.supabaseUserId, supabaseUser.id),
				eq(teams.dbId, teamDbId),
			),
		);

	if (team.length === 0) {
		throw new Error("User does not have a team");
	}
	return team[0];
}
