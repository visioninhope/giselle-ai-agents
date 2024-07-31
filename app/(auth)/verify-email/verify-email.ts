"use server";

import { type AuthError, createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export const verifyEmail = async (
	prevState: null | AuthError,
	formData: FormData,
): Promise<AuthError | null> => {
	console.log("verify");
	const verificationEmail = formData.get("verificationEmail") as string;
	const token = formData.get("token") as string;
	const supabase = createClient();
	const { data, error } = await supabase.auth.verifyOtp({
		email: verificationEmail,
		token,
		type: "email",
	});
	if (error != null) {
		console.log(JSON.stringify(error));
		return {
			code: error.code,
			message: error.message,
			status: error.status,
			name: error.name,
		};
	}
	redirect("/agents");
	// return null;
};
