"use server";

import { type AuthError, createClient } from "@/lib/supabase";
import { initializeAccount } from "@/services/accounts";
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
	console.log(JSON.stringify(error));
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

	await initializeAccount(supabaseData.user.id);

	redirect("/v2/agents");
};
