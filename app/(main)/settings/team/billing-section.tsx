import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	db,
	subscriptions,
	supabaseUserMappings,
	teamMemberships,
	teams,
} from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { stripe } from "@/services/external/stripe";
import { and, eq, sql } from "drizzle-orm";
import { Suspense } from "react";
import { Card } from "../components/card";

export default async function BillingSection() {
	const team = await fetchTeam();
	const isProPlan = team.subscriptionId != null || team.isInternalTeam;

	return (
		<Card title="Billing">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-zinc-400">Current Plan</p>
					<p className="text-xl font-semibold text-zinc-200">
						{isProPlan ? "Pro" : "Free"} Plan
					</p>
				</div>
				{!team.isInternalTeam && (
					<Suspense
						fallback={<Skeleton className="h-10 w-[120px] rounded-md" />}
					>
						<BillingButton subscriptionId={team.subscriptionId} />
					</Suspense>
				)}
			</div>
		</Card>
	);
}

type BillingButtonProps = {
	subscriptionId: string | null;
};

async function BillingButton({ subscriptionId }: BillingButtonProps) {
	if (subscriptionId == null) {
		return <Button className="w-fit">Upgrade Plan</Button>;
	}

	const subscription = await stripe.subscriptions.retrieve(subscriptionId);
	const customerId = subscription.customer;

	return (
		<Button className="w-fit" formAction={() => console.log(customerId)}>
			Manage Billing
		</Button>
	);
}

async function fetchTeam() {
	const user = await getUser();

	// FIXME: Users may have multiple teams. fetching the team should be changed in near future.
	const [team] = await db
		.select({
			dbid: teams.dbId,
			name: teams.name,
			// isInternalTeam: teams.isInternalTeam,
			isInternalTeam: sql<boolean>`false`,
			subscriptionId: subscriptions.id,
		})
		.from(teams)
		.innerJoin(teamMemberships, eq(teams.dbId, teamMemberships.teamDbId))
		.innerJoin(
			supabaseUserMappings,
			eq(teamMemberships.userDbId, supabaseUserMappings.userDbId),
		)
		.leftJoin(
			subscriptions,
			and(
				eq(subscriptions.teamDbId, teams.dbId),
				eq(subscriptions.status, "active"),
			),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, user.id));
	return team;
}
