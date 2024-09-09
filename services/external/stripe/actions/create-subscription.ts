import {
	db,
	organizations,
	stripeUserMappings,
	subscriptions,
	teamMemberships,
	teams,
	users,
} from "@/drizzle";
import { eq } from "drizzle-orm";
import { stripe } from "../config";

export const createSubscription = async (
	subscriptionId: string,
	customerId: string,
) => {
	const subscription = await stripe.subscriptions.retrieve(subscriptionId);

	const [organization] = await db
		.selectDistinct({ dbId: organizations.dbId })
		.from(organizations)
		.innerJoin(teams, eq(teams.organizationDbId, organizations.dbId))
		.innerJoin(teamMemberships, eq(teamMemberships.teamDbId, teams.dbId))
		.innerJoin(users, eq(users.dbId, teamMemberships.userDbId))
		.innerJoin(stripeUserMappings, eq(stripeUserMappings.userDbId, users.dbId))
		.where(eq(stripeUserMappings.stripeCustomerId, customerId));

	await db.insert(subscriptions).values({
		organizationDbId: organization.dbId,
		id: subscription.id,
	});
};
