import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { DeleteTeam } from "./delete-team";
import { TeamName } from "./team-name";

export default async function TeamPage() {
	return (
		<div className="flex flex-col gap-[24px]">
			<h3
				className="text-primary-100 font-semibold text-[28px] leading-[28px] tracking-[-0.011em] font-hubot"
				style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
			>
				General
			</h3>
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
				<DeleteTeam />
			</div>
		</div>
	);
}