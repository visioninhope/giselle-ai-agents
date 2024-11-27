import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { TeamName } from "./team-name";

export default function TeamPage() {
	return (
		<div className="grid gap-[16px]">
			<h3
				className="text-[32px] text-black--30 font-rosart"
				style={{ textShadow: "0px 0px 20px hsla(207, 100%, 48%, 1)" }}
			>
				Team
			</h3>

			<Suspense fallback={<Skeleton className="h-full w-full" />}>
				<TeamName />
			</Suspense>
		</div>
	);
}
