"use server";

import { createClient } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

class PasswordResetError extends AuthError {
	constructor(message: string, status?: number, code?: string) {
		super(message, status, code);
		this.name = "PasswordResetError";
	}
}

export const resetPassword = async (
	_prevState: AuthError | null,
	formData: FormData,
): Promise<AuthError | null> => {
	const newPassword = formData.get("new_password");
	if (newPassword == null || typeof newPassword !== "string") {
		return new AuthError("invalid_new_password");
	}
	const supabase = await createClient();
	const { error } = await supabase.auth.updateUser({ password: newPassword });
	if (error?.code === "same_password") {
		return new PasswordResetError(
			"The new password must be different from your current password",
			422,
			error.code,
		);
	}
	if (error) {
		console.error("Password reset error:", error);
		return new PasswordResetError(
			"Failed to reset password. Please try again later.",
			400,
			error.code,
		);
	}
	redirect("/password_reset/complete");
	return null;
};
