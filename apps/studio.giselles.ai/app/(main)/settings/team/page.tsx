import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";
import { Suspense } from "react";
import BillingSection from "./billing-section";
import { DeleteTeam } from "./delete-team";
import { TeamName } from "./team-name";

export default async function TeamPage() {
	return (
		<div className="flex flex-col gap-[24px]">
			<div className="flex justify-between items-center">
				<h3
					className="text-primary-100 font-semibold text-[28px] leading-[28px] tracking-[-0.011em] font-hubot"
					style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
				>
					Settings
				</h3>
				<a
					href="https://docs.giselles.ai/guides/settings/team/billing"
					target="_blank"
					rel="noopener noreferrer"
					className="text-black-300 text-[14px] font-medium border border-black-300 rounded-[4px] px-1.5 py-0.5 hover:bg-black-300/10 flex items-center gap-1.5 font-hubot"
				>
					About Setting
					<ExternalLink size={14} />
				</a>
			</div>
			<div className="flex flex-col gap-y-[16px]">
				<Suspense
					fallback={
						<div className="w-full h-24">
							<Skeleton className="h-full w-full" />
						</div>
					}
				>
					<TeamName />
				</Suspense>

				{/* Billing Section */}
				<div>
					<BillingSection />
				</div>

				{/* Delete Team Section */}
				<div className="mt-8">
					<h4 className="text-white-400 font-medium text-[18px] leading-[22px] tracking-normal font-hubot mb-4">
						Danger Zone
					</h4>
					<DeleteTeam />
				</div>
			</div>
		</div>
	);
}
