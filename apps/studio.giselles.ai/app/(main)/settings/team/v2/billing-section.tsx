import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/v2/ui/button";
import { fetchCurrentTeam, isProPlan } from "@/services/teams";
import { manageBilling } from "@/services/teams/actions/manage-billing";
import { upgradeTeam } from "@/services/teams/actions/upgrade-team";
import type { CurrentTeam } from "@/services/teams/types";
import { Suspense } from "react";
import { getSubscription } from "../actions";
import { LocalDateTime } from "../components/local-date-time";

export default async function BillingSection() {
	const team = await fetchCurrentTeam();

	return (
		<Card className="flex items-center justify-between gap-x-1 py-4 border-none bg-transparent">
			<div className="flex flex-col gap-y-1">
				<div className="flex flex-wrap items-center gap-x-2 text-white-800 font-medium">
					<p className="text-[14px] leading-[23.8px] font-geist">
						Thank you for being
					</p>
					<p className="text-[22px] leading-[26.4px] tracking-[-0.04em] font-hubot">
						{isProPlan(team) ? "Pro" : "Free"}
					</p>
					<p className="text-[14px] leading-[19.6px] font-hubot">
						, {team.name}
					</p>
				</div>
				<p className="text-black-400 font-medium text-[12px] leading-[20.4px] font-geist">
					Have questions about your plan?{" "}
					<a
						href="https://giselles.ai/pricing"
						target="_blank"
						className="text-blue-80 underline"
						rel="noreferrer"
					>
						Learn about plans and pricing
					</a>
				</p>
				{team.activeSubscriptionId && (
					<Suspense fallback={<Skeleton className="h-5 w-[300px] mt-2" />}>
						<CancellationNotice subscriptionId={team.activeSubscriptionId} />
					</Suspense>
				)}
			</div>

			{team.type !== "internal" && (
				<form>
					<Suspense
						fallback={<Skeleton className="h-10 w-[120px] rounded-md" />}
					>
						<BillingButton
							subscriptionId={team.activeSubscriptionId}
							team={team}
						/>
					</Suspense>
				</form>
			)}
		</Card>
	);
}

type CancellationNoticeProps = {
	subscriptionId: string;
};

async function CancellationNotice({ subscriptionId }: CancellationNoticeProps) {
	const result = await getSubscription(subscriptionId);

	if (!result.success || !result.data) {
		console.error("Failed to fetch subscription:", result.error);
		return null;
	}

	const subscription = result.data;
	if (!subscription.cancelAtPeriodEnd || !subscription.cancelAt) {
		return null;
	}

	return (
		<p className="mt-2 font-medium text-sm leading-[20.4px] text-warning-900 font-geist">
			Subscription will end on <LocalDateTime date={subscription.cancelAt} />
		</p>
	);
}

type BillingButtonProps = {
	subscriptionId: string | null;
	team: CurrentTeam;
};

// NOTE: If this component becomes a client component, we need to remove team.dbId to prevent exposure of internal IDs in the client bundle.
async function BillingButton({ subscriptionId, team }: BillingButtonProps) {
	const upgrateTeamWithTeam = upgradeTeam.bind(null, team);
	if (subscriptionId == null) {
		return (
			<Button className="w-fit" formAction={upgrateTeamWithTeam}>
				Upgrade
			</Button>
		);
	}

	const manageBillingWithSubscriptionId = manageBilling.bind(
		null,
		subscriptionId,
	);
	return (
		<Button className="w-fit" formAction={manageBillingWithSubscriptionId}>
			Manage Billing
		</Button>
	);
}
