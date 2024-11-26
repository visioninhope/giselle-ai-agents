"use server";

import { redirect } from "next/navigation";

export async function createTeam(formData: FormData) {
	const teamName = formData.get("teamName") as string;
	const selectedPlan = formData.get("selectedPlan") as string;

	// Here you would typically save the team to your database
	console.log(`Creating team: ${teamName} with plan: ${selectedPlan}`);

	if (selectedPlan === "pro") {
		// Redirect to Stripe checkout
		// This is a placeholder URL, replace with your actual Stripe checkout URL
		redirect("/api/stripe-checkout");
	} else {
		// Redirect to the new team's page
		redirect("/teams/new-team-id");
	}
}
