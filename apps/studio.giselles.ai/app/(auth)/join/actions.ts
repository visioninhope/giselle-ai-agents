"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginUser(formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const token = formData.get("token") as string;
	const supabase = await createClient();
	const { error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) {
		return { error: error.message };
	}
	// If success, redirect to the join page
	redirect(`/join/${token}`);
}
