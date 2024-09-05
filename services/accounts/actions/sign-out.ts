"use server";

import { createClient } from "@/lib/supabase";
import { redirect } from "next/navigation";

export const signOut = async () => {
	createClient().auth.signOut();
	redirect("/login");
};
