"use server";

import {
	db,
	organizations,
	supabaseUserMappings,
	teamMemberships,
	teams,
	users,
} from "@/drizzle";
import type { User } from "@supabase/auth-js";

export const initializeAccount = async (supabaseUserId: User["id"]) => {
	await db.transaction(async (tx) => {
		const [user] = await tx.insert(users).values({}).returning({
			id: users.dbId,
		});
		await tx.insert(supabaseUserMappings).values({
			userDbId: user.id,
			supabaseUserId,
		});
		const [organization] = await tx
			.insert(organizations)
			.values({
				name: "default",
			})
			.returning({
				id: organizations.dbId,
			});
		const [team] = await tx
			.insert(teams)
			.values({
				organizationDbId: organization.id,
				name: "default",
			})
			.returning({
				id: teams.dbId,
			});

		await tx.insert(teamMemberships).values({
			userDbId: user.id,
			teamDbId: team.id,
			role: "admin",
		});
	});
};
