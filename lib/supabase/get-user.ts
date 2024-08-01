import { createClient } from "./server";

/**
 * Retrieves the currently authenticated user.
 *
 * @throws {Error} If the user is not authenticated or if there's an error during the authentication check.
 *
 * @remarks
 * IMPORTANT: This function will throw an error if executed while the user is not authenticated.
 * Make sure the user is logged in before calling this function.
 */
export const getUser = async () => {
	const supabase = createClient();

	const { data, error } = await supabase.auth.getUser();
	if (error != null) {
		throw error;
	}
	if (data.user == null) {
		throw new Error("No user returned");
	}
	return data.user;
};
