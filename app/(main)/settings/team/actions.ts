"use server";

import { db, supabaseUserMappings, teamMemberships, teams } from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateTeamName(teamDbId: number, formData: FormData) {
	const newName = formData.get("name") as string;
	const user = await getUser();

	try {
		await db.transaction(async (tx) => {
			const team = await tx
				.select({ dbId: teams.dbId })
				.from(teams)
				.for("update")
				.innerJoin(teamMemberships, eq(teams.dbId, teamMemberships.teamDbId))
				.innerJoin(
					supabaseUserMappings,
					eq(teamMemberships.userDbId, supabaseUserMappings.userDbId),
				)
				.where(
					and(
						eq(supabaseUserMappings.supabaseUserId, user.id),
						eq(teams.dbId, teamDbId),
					),
				);

			if (team.length === 0) {
				throw new Error("Team not found");
			}

			await tx
				.update(teams)
				.set({ name: newName })
				.where(eq(teams.dbId, team[0].dbId));
		});
		revalidatePath("/settings/team");

		return { success: true };
	} catch (error) {
		console.error("Failed to update team name:", error);
		return { success: false, error };
	}
}
