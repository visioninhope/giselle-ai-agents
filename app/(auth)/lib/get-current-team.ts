import { db, supabaseUserMappings, teamMemberships, teams } from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { eq } from "drizzle-orm";

export const getCurrentTeam = async () => {
	const user = await getUser();
	const [team] = await db
		.select({
			id: teams.id,
		})
		.from(teams)
		.innerJoin(teamMemberships, eq(teamMemberships.teamId, teams.id))
		.innerJoin(
			supabaseUserMappings,
			eq(supabaseUserMappings.userId, teamMemberships.userId),
		);
	return team;
};
