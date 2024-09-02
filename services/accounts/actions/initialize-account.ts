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
			id: users.id,
		});
		await tx.insert(supabaseUserMappings).values({
			userId: user.id,
			supabaseUserId,
		});
		const [organization] = await tx
			.insert(organizations)
			.values({
				name: "default",
			})
			.returning({
				id: organizations.id,
			});
		const [team] = await tx
			.insert(teams)
			.values({
				organizationId: organization.id,
				name: "default",
			})
			.returning({
				id: teams.id,
			});

		await tx.insert(teamMemberships).values({
			userId: user.id,
			teamId: team.id,
			role: "admin",
		});
	});
};
