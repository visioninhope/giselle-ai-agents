"use server";

import { db, supabaseUserMappings, userInitialTasks } from "@/drizzle";
import { type AuthError, createClient } from "@/lib/supabase";
import { runs } from "@trigger.dev/sdk/v3";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(
	prevState: AuthError | null,
	formData: FormData,
): Promise<AuthError | null> {
	const supabase = createClient();

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const credentails = {
		email: formData.get("email") as string,
		password: formData.get("password") as string,
	};

	const { data, error } = await supabase.auth.signInWithPassword(credentails);

	if (error) {
		return {
			code: error.code,
			status: error.status,
			message: error.message,
			name: error.name,
		};
	}
	const [task] = await db
		.select({ id: userInitialTasks.taskId })
		.from(supabaseUserMappings)
		.innerJoin(
			userInitialTasks,
			eq(userInitialTasks.userId, supabaseUserMappings.userId),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, data.user.id));
	const run = await runs.retrieve(task.id);
	if (run.status === "COMPLETED") {
		redirect("/");
		return null;
	}
	redirect("/initializing-account");
	return null;
}
