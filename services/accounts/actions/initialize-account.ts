"use server";

import {
	db,
	organizations,
	supabaseUserMappings,
	teamMemberships,
	teams,
	users,
} from "@/drizzle";
import { createId } from "@paralleldrive/cuid2";
import type { User } from "@supabase/auth-js";

export const initializeAccount = async (supabaseUserId: User["id"]) => {
	const result = await db.transaction(async (tx) => {
		const userId = `usr_${createId()}` as const;
		const [user] = await tx
			.insert(users)
			.values({
				id: userId,
			})
			.returning({
				dbId: users.dbId,
			});
		await tx.insert(supabaseUserMappings).values({
			userDbId: user.dbId,
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
			userDbId: user.dbId,
			teamDbId: team.id,
			role: "admin",
		});
		return { id: userId };
	});
	return result;
};
