import { UserButton } from "@/components/user-button";
import { createClient, getUser } from "@/lib/supabase";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function AgentsLayout({
	children,
}: {
	children: ReactNode;
}) {
	async function signOut() {
		"use server";
		/** @todo Error handling */
		createClient().auth.signOut();
		redirect("/login");
	}
	return (
		<div className="w-screen h-screen overflow-x-hidden">
			<div className="flex flex-col min-h-screen">
				<header className="flex justify-between container items-center h-10">
					<div />
					<UserButton />
				</header>
				<main className="flex flex-1">{children}</main>
			</div>
		</div>
	);
}
