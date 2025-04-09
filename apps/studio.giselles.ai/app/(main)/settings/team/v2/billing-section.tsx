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
		<div className="flex flex-col gap-y-4">
			<Card className="flex items-center justify-between gap-x-1 py-4 border-none bg-transparent">
				<div className="flex flex-col gap-y-1">
					<div className="flex flex-wrap items-center gap-x-2 text-white-800 font-medium">
						<p className="text-[22px] leading-[26.4px] tracking-[-0.04em] font-hubot">
							{isProPlan(team) ? "Pro Plan" : "Free Plan"}
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

				{!isProPlan(team) && team.type !== "internal" && (
					<form>
						<Suspense
							fallback={<Skeleton className="h-10 w-[120px] rounded-md" />}
						>
							<UpgradeButton team={team} />
						</Suspense>
					</form>
				)}
			</Card>

			{isProPlan(team) && team.type !== "internal" && (
				<PaymentInfo team={team} />
			)}
		</div>
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

// NOTE: If this component becomes a client component, we need to remove team.dbId to prevent exposure of internal IDs in the client bundle.
function UpgradeButton({ team }: { team: CurrentTeam }) {
	const upgradeTeamWithTeam = upgradeTeam.bind(null, team);

	return (
		<Button className="w-fit" formAction={upgradeTeamWithTeam}>
			Upgrade to Pro
		</Button>
	);
}

function UpdateButton({ subscriptionId }: { subscriptionId: string }) {
	const manageBillingWithSubscriptionId = manageBilling.bind(
		null,
		subscriptionId,
	);

	return (
		<Button className="w-fit" formAction={manageBillingWithSubscriptionId}>
			Update
		</Button>
	);
}

function PaymentInfo({ team }: { team: CurrentTeam }) {
	if (team.activeSubscriptionId === null) {
		throw new Error("Subscription id not found");
	}

	return (
		<Card className="flex justify-between items-center px-6 pt-4 pb-6 border-[0.5px] border-black-400 rounded-[8px] bg-transparent">
			<div className="flex flex-col gap-y-[3px]">
				<h2 className="text-white-400 text-[16px] leading-[27.2px] tracking-normal font-hubot">
					Payment Information
				</h2>
				<p className="text-black-400 text-[12px] leading-[20.4px] tracking-normal font-geist">
					Powered by Stripe
				</p>
			</div>
			<form>
				<Suspense fallback={<Skeleton className="h-10 w-[120px] rounded-md" />}>
					<UpdateButton subscriptionId={team.activeSubscriptionId} />
				</Suspense>
			</form>
		</Card>
	);
}
