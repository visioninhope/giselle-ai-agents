"use server";

import { createClient } from "@/lib/supabase";
import { initializeAccount } from "@/services/accounts";
import { redirect } from "next/navigation";

export async function verifyJoinEmail(formData: FormData) {
	const invitedEmail = formData.get("invitedEmail") as string;
	const otpToken = formData.get("token") as string;
	const invitationToken = formData.get("invitationToken") as string;
	const supabase = await createClient();
	const { data, error } = await supabase.auth.verifyOtp({
		email: invitedEmail,
		token: otpToken,
		type: "email",
	});
	if (error) {
		return { error: error.message };
	}
	if (!data.user) {
		return { error: "No user returned" };
	}
	await initializeAccount(data.user.id, data.user.email);
	redirect(`/join/${invitationToken}`);
}

export async function resendJoinOtp(formData: FormData) {
	const invitedEmail = formData.get("invitedEmail") as string;
	const supabase = await createClient();
	const { error } = await supabase.auth.resend({
		type: "signup",
		email: invitedEmail,
	});
	if (error) {
		return {
			code: error.code,
			message: error.message,
			status: error.status,
			name: error.name,
		};
	}
	return {
		code: "success",
		status: 200,
		message: "A new confirmation code has been sent to your email address.",
		name: "Success",
	};
}
