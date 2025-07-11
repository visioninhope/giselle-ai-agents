"use server";

import { redirect } from "next/navigation";
import { isValidReturnUrl } from "@/app/(auth)/lib";
import { type AuthError, createClient } from "@/lib/supabase";

export async function login(
	_prevState: AuthError | null,
	formData: FormData,
): Promise<AuthError | null> {
	const supabase = await createClient();

	// type-casting here for convenience
	// in practice, you should validate your inputs
	const credentails = {
		email: formData.get("email") as string,
		password: formData.get("password") as string,
	};
	const returnUrlEntry = formData.get("returnUrl");
	const { error } = await supabase.auth.signInWithPassword(credentails);

	if (error) {
		return {
			code: error.code,
			status: error.status,
			message: error.message,
			name: error.name,
		};
	}

	// Validate returnUrl to prevent open redirect attacks
	const validReturnUrl = isValidReturnUrl(returnUrlEntry)
		? returnUrlEntry
		: "/apps";
	redirect(validReturnUrl);
	return null;
}
