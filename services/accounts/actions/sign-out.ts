"use server";

import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export const signOut = async () => {
	await createClient().auth.signOut();
	redirect("/login");
};
