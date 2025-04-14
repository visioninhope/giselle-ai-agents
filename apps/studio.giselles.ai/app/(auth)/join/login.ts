"use server";

import { type AuthError, createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export async function login(
	prevState: AuthError | null,
	formData: FormData,
): Promise<AuthError | null> {
	try {
		const supabase = await createClient();

		// type-casting here for convenience
		// in practice, you should validate your inputs
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const confirmPassword = formData.get("confirmPassword") as string;

		// Verify passwords match
		if (password !== confirmPassword) {
			return {
				code: "auth/passwords-do-not-match",
				status: 400,
				message: "Passwords do not match.",
				name: "PasswordMatchError",
			};
		}

		// For demo purposes, we're using the fixed email from the form
		const credentials = {
			email,
			password,
		};

		const { data, error } = await supabase.auth.signInWithPassword(credentials);

		if (error) {
			return {
				code: error.code,
				status: error.status,
				message: error.message,
				name: error.name,
			};
		}

		// For now, just redirect to the apps page after login
		redirect("/apps");

		return null;
	} catch (err) {
		console.error("Login error:", err);
		return {
			code: "unknown_error",
			status: 500,
			message: "An unexpected error occurred during login.",
			name: "UnknownError",
		};
	}
}
