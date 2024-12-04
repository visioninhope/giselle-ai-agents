import { db, supabaseUserMappings, teamMemberships, teams } from "@/drizzle";
import { getGiselleSession } from "@/lib/giselle-session";
import { getUser } from "@/lib/supabase";
import { and, asc, eq } from "drizzle-orm";

export async function fetchCurrentTeam() {
	const supabaseUser = await getUser();
	const session = await getGiselleSession();
	const teamDbId = session?.teamDbId;

	if (teamDbId == null) {
		return fetchFirstTeam(supabaseUser.id);
	}

	const team = await fetchTeam(teamDbId, supabaseUser.id);
	if (team == null) {
		// fallback to first team
		return fetchFirstTeam(supabaseUser.id);
	}
	return team;
}

async function fetchTeam(teamDbId: number, supabaseUserId: string) {
	const result = await db
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
				eq(supabaseUserMappings.supabaseUserId, supabaseUserId),
				eq(teams.dbId, teamDbId),
			),
		);
	if (result.length === 0) {
		return null;
	}
	return result[0];
}

async function fetchFirstTeam(supabaseUserId: string) {
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
		.where(eq(supabaseUserMappings.supabaseUserId, supabaseUserId))
		.orderBy(asc(teams.dbId))
		.limit(1);

	if (team.length === 0) {
		throw new Error("User does not have a team");
	}
	return team[0];
}
