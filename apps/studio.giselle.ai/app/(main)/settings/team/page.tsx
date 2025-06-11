import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrentTeam } from '@/types';

interface BillingInfoProps {
	team: CurrentTeam;
}

function BillingInfoForFreePlan({ team }: BillingInfoProps) {
	if (isProPlan(team)) {
		return null;
	}
	return [
		<div key="plan-info" className="flex flex-col gap-y-0.5">
			<div className="flex flex-wrap items-center gap-x-1 text-white-800 font-medium">
				<p className="text-[22px] leading-[26.4px] tracking-[-0.04em] font-sans">
					Free Plan
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
		</div>,
		<form key="upgrade-form">
			<Suspense fallback={<Skeleton className="h-10 w-[120px] rounded-md" />}>
				<UpgradeButton team={team} />
			</Suspense>
		</form>,
	];
}

function BillingInfoForProPlan({ team }: BillingInfoProps) {
	if (!isProPlan(team)) {
		return null;
	}
	return [
		<div key="plan-info" className="flex flex-col gap-y-[2px]">
			<div className="flex flex-col gap-0.5">
				<p className="text-[22px] leading-[26.4px] tracking-[-0.04em] font-medium font-sans">
					<span className="text-primary-400">Pro Plan</span>
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
		</div>,
		team.activeSubscriptionId && (
			<form key="update-form">
				<Suspense
					fallback={<Skeleton className="h-10 w-[120px] rounded-md" />}
				>
					<UpdateButton subscriptionId={team.activeSubscriptionId} />
				</Suspense>
			</form>
		),
	];
}

function UpgradeButton({ team }: { team: CurrentTeam }) {
	// ... existing code ...
}

function CancellationNotice({ subscriptionId }: { subscriptionId: string }) {
	// ... existing code ...
}

function UpdateButton({ subscriptionId }: { subscriptionId: string }) {
	// ... existing code ...
 