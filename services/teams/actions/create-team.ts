"use server";

import {
	db,
	supabaseUserMappings,
	teamMemberships,
	teams,
	users,
} from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { isEmailFromRoute06 } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function createTeam(formData: FormData) {
	const teamName = formData.get("teamName") as string;
	const selectedPlan = formData.get("selectedPlan") as string;

	const supabaseUser = await getUser();
	if (!supabaseUser) {
		throw new Error("User not found");
	}

	const isInternalUser =
		supabaseUser.email != null && isEmailFromRoute06(supabaseUser.email);
	if (isInternalUser) {
		createInternalTeam(supabaseUser, teamName);
		// FIXME: change context to the new team
		redirect("/settings/team");
	}

	if (selectedPlan === "free") {
		createFreeTeam(supabaseUser, teamName);
		// FIXME: change context to the new team
		redirect("/settings/team");
	}

	prepareProTeamCreation(supabaseUser, teamName);
}

/**
 * 1. Create a new draft team
 * 2. Set the draft team ID in metadata (https://support.stripe.com/questions/using-metadata-with-checkout-sessions)
 * 3. Redirect to the Stripe checkout page
 */
async function prepareProTeamCreation(supabaseUser: User, teamName: string) {
	throw new Error("Not implemented");
}

async function createInternalTeam(supabaseUser: User, teamName: string) {
	await createTeamInDatabase(supabaseUser, teamName, true);
}

async function createFreeTeam(supabaseUser: User, teamName: string) {
	await createTeamInDatabase(supabaseUser, teamName, false);
}

async function createTeamInDatabase(
	supabaseUser: User,
	teamName: string,
	isInternal: boolean,
) {
	const [result] = await db
		.insert(teams)
		.values({
			name: teamName,
			isInternalTeam: isInternal,
		})
		.returning({ dbid: teams.dbId });

	const teamDbId = result.dbid;
	const [{ dbId: userDbId }] = await db
		.select({ dbId: users.dbId })
		.from(users)
		.innerJoin(
			supabaseUserMappings,
			eq(users.dbId, supabaseUserMappings.userDbId),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, supabaseUser.id));

	// add membership
	await db.insert(teamMemberships).values({
		teamDbId,
		userDbId,
		role: "admin",
	});
}
