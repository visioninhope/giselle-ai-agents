"use server";

import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

interface SerializableError {
	name: string;
	message: string;
	status: number;
	code?: string;
}

const createError = (
	message: string,
	status: number,
	code?: string,
): SerializableError => ({
	name: "PasswordResetError",
	message,
	status,
	code,
});

export const resetPassword = async (
	_prevState: SerializableError | null,
	formData: FormData,
): Promise<SerializableError | null> => {
	const newPassword = formData.get("new_password");
	if (newPassword == null || typeof newPassword !== "string") {
		return createError(
			"Please enter a valid password",
			422,
			"validation_failed",
		);
	}
	const supabase = await createClient();
	const { error } = await supabase.auth.updateUser({ password: newPassword });
	if (error?.code === "same_password") {
		return createError(
			"The new password must be different from your current password",
			422,
			error.code,
		);
	}
	if (error) {
		console.error("Password reset error:", error);
		return createError(
			"Failed to reset password. Please try again later.",
			400,
			error.code,
		);
	}
	redirect("/password_reset/complete");
	return null;
};
