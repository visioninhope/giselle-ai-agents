"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase";

export async function signup(email: string, password: string) {
	const supabase = createClient();

	if (!email.endsWith("@route06.co.jp")) {
		return {
			code: "invalid_email_domain",
			status: 400,
			message: "Invalid email domain.",
			name: "InvalidEmailDomainError",
		};
	}

	const { error } = await supabase.auth.signUp({ email, password });

	if (error != null) {
		return {
			code: error.code,
			status: error.status,
			message: error.message,
			name: error.name,
		};
	}

	redirect("/verify-email");
	return null;
}
