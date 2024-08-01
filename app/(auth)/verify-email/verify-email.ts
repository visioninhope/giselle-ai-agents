"use server";

import { db, supabaseUserMappings, userInitialTasks, users } from "@/drizzle";
import { type AuthError, createClient } from "@/lib/supabase";
import { initializeAccountTask } from "@/trigger/initializeAccount";
import { redirect } from "next/navigation";

export const verifyEmail = async (
	prevState: null | AuthError,
	formData: FormData,
): Promise<AuthError | null> => {
	const verificationEmail = formData.get("verificationEmail") as string;
	const token = formData.get("token") as string;
	const supabase = createClient();
	const { data: supabaseData, error } = await supabase.auth.verifyOtp({
		email: verificationEmail,
		token,
		type: "email",
	});
	if (error != null) {
		return {
			code: error.code,
			message: error.message,
			status: error.status,
			name: error.name,
		};
	}
	if (supabaseData.user == null) {
		return {
			code: "unknown",
			status: 500,
			message: "No user returned",
			name: "UnknownError",
		};
	}

	const [user] = await db.insert(users).values({}).returning({
		id: users.id,
	});
	await db.insert(supabaseUserMappings).values({
		userId: user.id,
		supabaseUserId: supabaseData.user.id,
	});
	const handle = await initializeAccountTask.trigger({
		userId: user.id,
	});
	await db.insert(userInitialTasks).values({
		userId: user.id,
		taskId: handle.id,
	});

	redirect("/account-initialization");
};
