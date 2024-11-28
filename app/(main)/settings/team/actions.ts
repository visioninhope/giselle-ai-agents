"use server";

import {
	UserId,
	db,
	supabaseUserMappings,
	teamMemberships,
	teams,
} from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getTeamName() {
	const user = await getUser();

	// TODO: In the future, this query will be changed to retrieve from the selected team ID
	const _teams = await db
		.select({ dbId: teams.dbId, name: teams.name })
		.from(teams)
		.innerJoin(teamMemberships, eq(teams.dbId, teamMemberships.teamDbId))
		.innerJoin(
			supabaseUserMappings,
			eq(teamMemberships.userDbId, supabaseUserMappings.userDbId),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, user.id));

	return _teams[0].name;
}

export async function updateTeamName(formData: FormData) {
	const newName = formData.get("name") as string;
	const user = await getUser();

	try {
		const team = await db
			.select({ dbId: teams.dbId })
			.from(teams)
			.innerJoin(teamMemberships, eq(teams.dbId, teamMemberships.teamDbId))
			.innerJoin(
				supabaseUserMappings,
				eq(teamMemberships.userDbId, supabaseUserMappings.userDbId),
			)
			.where(eq(supabaseUserMappings.supabaseUserId, user.id));

		if (team.length === 0) {
			throw new Error("Team not found");
		}

		await db
			.update(teams)
			.set({ name: newName })
			.where(eq(teams.dbId, team[0].dbId))
			.execute();

		revalidatePath("/settings/team");

		return { success: true };
	} catch (error) {
		console.error("Failed to update team name:", error);
		return { success: false, error };
	}
}
