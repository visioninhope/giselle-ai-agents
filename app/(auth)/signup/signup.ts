"use server";

import { redirect } from "next/navigation";

import { type AuthError, createClient } from "@/lib/supabase";
import { cookies } from "next/headers";

export async function signup(prevState: AuthError | null, formData: FormData) {
	const supabase = createClient();

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const credentials = {
		email: formData.get("email") as string,
		password: formData.get("password") as string,
	};

	const { error } = await supabase.auth.signUp(credentials);

	if (error != null) {
		return {
			code: error.code,
			status: error.status,
			message: error.message,
			name: error.name,
		};
	}
	cookies().set("verification-email", credentials.email, {
		httpOnly: true,
		secure: true,
		maxAge: 60,
	});

	redirect("/verify-email");
	return null;
}
