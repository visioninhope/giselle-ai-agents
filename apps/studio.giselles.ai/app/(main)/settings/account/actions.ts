"use server";

import { db, supabaseUserMappings, users } from "@/drizzle";
import { settingsV2Flag } from "@/flags";
import { logger } from "@/lib/logger";
import { getUser } from "@/lib/supabase";
import {
	connectIdentity,
	disconnectIdentity,
	reconnectIdentity,
} from "@/services/accounts";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function returnPath() {
	const settingsV2 = await settingsV2Flag();
	if (settingsV2) {
		return "/settings/account/authentication";
	}
	return "/settings/account";
}

export async function connectGoogleIdentity() {
	return connectIdentity("google", await returnPath());
}

export async function connectGitHubIdentity() {
	return connectIdentity("github", await returnPath());
}

export async function reconnectGoogleIdentity() {
	return reconnectIdentity("google", await returnPath());
}

export async function reconnectGitHubIdentity() {
	return reconnectIdentity("github", await returnPath());
}

export async function disconnectGoogleIdentity() {
	return disconnectIdentity("google", await returnPath());
}

export async function disconnectGitHubIdentity() {
	return disconnectIdentity("github", await returnPath());
}

export async function getAccountInfo() {
	try {
		const supabaseUser = await getUser();

		const _users = await db
			.select({ displayName: users.displayName, email: users.email })
			.from(users)
			.innerJoin(
				supabaseUserMappings,
				eq(users.dbId, supabaseUserMappings.userDbId),
			)
			.where(eq(supabaseUserMappings.supabaseUserId, supabaseUser.id));

		return _users[0];
	} catch (error) {
		logger.error("Failed to get account info:", error);
		throw error;
	}
}

export async function updateDisplayName(formData: FormData) {
	try {
		const supabaseUser = await getUser();

		if (!supabaseUser) {
			throw new Error("User not found");
		}

		const displayName = formData.get("displayName") as string;

		const userDbIdSubquery = db
			.select({ userDbId: supabaseUserMappings.userDbId })
			.from(supabaseUserMappings)
			.where(eq(supabaseUserMappings.supabaseUserId, supabaseUser.id));

		await db
			.update(users)
			.set({ displayName })
			.where(eq(users.dbId, userDbIdSubquery));

		revalidatePath(await returnPath());

		return { success: true };
	} catch (error) {
		logger.error("Failed to update display name:", error);
		return { success: false, error };
	}
}
