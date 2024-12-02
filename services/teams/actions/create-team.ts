"use server";

import {
	db,
	supabaseUserMappings,
	teamMemberships,
	teams,
	users,
} from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { isEmailFromRoute06 } from "@/lib/utils";
import { stripe } from "@/services/external/stripe";
import type { User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import invariant from "tiny-invariant";
import {
	DRAFT_TEAM_NAME_METADATA_KEY,
	DRAFT_TEAM_USER_DB_ID_METADATA_KEY,
} from "../constants";

export async function createTeam(formData: FormData) {
	const teamName = formData.get("teamName") as string;
	const selectedPlan = formData.get("selectedPlan") as string;

	const supabaseUser = await getUser();
	if (!supabaseUser) {
		throw new Error("User not found");
	}

	const isInternalUser =
		supabaseUser.email != null && isEmailFromRoute06(supabaseUser.email);
	if (isInternalUser) {
		createInternalTeam(supabaseUser, teamName);
		// FIXME: change context to the new team
		redirect("/settings/team");
	}

	if (selectedPlan === "free") {
		createFreeTeam(supabaseUser, teamName);
		// FIXME: change context to the new team
		redirect("/settings/team");
	}

	const checkoutUrl = await prepareProTeamCreation(supabaseUser, teamName);
	redirect(checkoutUrl);
}

/**
 * 1. Create a new draft team
 * 2. Set the draft team informations in metadata (https://support.stripe.com/questions/using-metadata-with-checkout-sessions)
 */
async function prepareProTeamCreation(supabaseUser: User, teamName: string) {
	const userDbId = await getUserDbId(supabaseUser);
	return createCheckout(userDbId, teamName);
}

async function createCheckout(userDbId: number, teamName: string) {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
	const serviceSiteUrl = process.env.NEXT_PUBLIC_SERVICE_SITE_URL;

	invariant(siteUrl, "NEXT_PUBLIC_SITE_URL is not set");
	invariant(serviceSiteUrl, "NEXT_PUBLIC_SERVICE_SITE_URL is not set");

	const proPlanPriceId = process.env.STRIPE_PRO_PLAN_PRICE_ID;
	const agentTimeChargePriceId = process.env.STRIPE_AGENT_TIME_CHARGE_PRICE_ID;
	const userSeatPriceId = process.env.STRIPE_USER_SEAT_PRICE_ID;

	invariant(proPlanPriceId, "STRIPE_PRO_PLAN_ID is not set");
	invariant(
		agentTimeChargePriceId,
		"STRIPE_AGENT_TIME_CHARGE_PRICE_ID is not set",
	);
	invariant(userSeatPriceId, "STRIPE_USER_SEAT_PRICE_ID is not set");

	const subscriptionMetadata: Record<string, string> = {
		[DRAFT_TEAM_USER_DB_ID_METADATA_KEY]: userDbId.toString(),
		[DRAFT_TEAM_NAME_METADATA_KEY]: teamName,
	};

	const checkoutSession = await stripe.checkout.sessions.create({
		mode: "subscription",
		line_items: [
			{
				price: proPlanPriceId,
				quantity: 1,
			},
			{
				price: agentTimeChargePriceId,
			},
			{
				price: userSeatPriceId,
			},
		],
		automatic_tax: { enabled: true },
		// FIXME: change context to the new team
		success_url: `${siteUrl}/settings/team`,
		cancel_url: `${serviceSiteUrl}/pricing`,
		subscription_data: {
			metadata: subscriptionMetadata,
		},
	});

	if (checkoutSession.url == null) {
		throw new Error("checkoutSession.url is null");
	}

	return checkoutSession.url;
}

async function createInternalTeam(supabaseUser: User, teamName: string) {
	await createTeamInDatabase(supabaseUser, teamName, true);
}

async function createFreeTeam(supabaseUser: User, teamName: string) {
	await createTeamInDatabase(supabaseUser, teamName, false);
}

async function createTeamInDatabase(
	supabaseUser: User,
	teamName: string,
	isInternal: boolean,
) {
	const [result] = await db
		.insert(teams)
		.values({
			name: teamName,
			type: isInternal ? "internal" : "customer",
		})
		.returning({ dbid: teams.dbId });

	const teamDbId = result.dbid;
	const userDbId = await getUserDbId(supabaseUser);

	// add membership
	await db.insert(teamMemberships).values({
		teamDbId,
		userDbId,
		role: "admin",
	});
}

async function getUserDbId(supabaseUser: User) {
	const [result] = await db
		.select()
		.from(users)
		.innerJoin(
			supabaseUserMappings,
			eq(users.dbId, supabaseUserMappings.userDbId),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, supabaseUser.id));
	return result.users.dbId;
}
