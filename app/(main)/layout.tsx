import { GiselleLogo } from "@/components/giselle-logo";
import { proTeamPlanFlag } from "@/flags";
import { UserButton } from "@/services/accounts/components";
import { TeamSelectionForm } from "@/services/teams/components/team-selection-form";
import Link from "next/link";
import type { ReactNode } from "react";
import { Nav } from "./nav";

export default async function Layout({ children }: { children: ReactNode }) {
	const proTeamPlan = await proTeamPlanFlag();

	return (
		<div className="h-screen overflow-y-hidden bg-black-100 divide-y divide-black-80 flex flex-col">
			<header className="h-[60px] flex items-center px-[24px] justify-between">
				<div className="flex">
					<Link href="/">
						<GiselleLogo className="w-[70px] h-auto fill-white mt-[4px] mr-[8px]" />
					</Link>
					<Nav />
				</div>
				<div className="flex items-center gap-4">
					{proTeamPlan && <TeamSelectionForm />}
					<UserButton />
				</div>
			</header>
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
