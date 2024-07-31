"use server";

import { type AuthError, createClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function login(
	prevState: AuthError | null,
	formData: FormData,
): Promise<AuthError | null> {
	const supabase = createClient();

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const data = {
		email: formData.get("email") as string,
		password: formData.get("password") as string,
	};

	const { error } = await supabase.auth.signInWithPassword(data);

	if (error) {
		return {
			code: error.code,
			status: error.status,
			message: error.message,
			name: error.name,
		};
	}

	redirect("/");
	return null;
}
