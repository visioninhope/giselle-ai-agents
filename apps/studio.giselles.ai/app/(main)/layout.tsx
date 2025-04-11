import { GiselleLogo } from "@/components/giselle-logo";
import { TeamSelection } from "@/services/teams/components/team-selection";
import Link from "next/link";
import type { ReactNode } from "react";
import { UserButton } from "@/services/accounts/components";
import { Nav } from "./nav";

export default async function Layout({ children }: { children: ReactNode }) {
	return (
		<div className="h-screen overflow-y-hidden bg-black-900 divide-y divide-black-80 flex flex-col">
			<header className="h-[60px] flex items-center px-[24px] justify-between">
				<div className="flex items-center gap-4">
					<Link href="/">
						<GiselleLogo className="w-[70px] h-auto fill-white mt-[4px]" />
					</Link>
					<span className="text-black-70">/</span>
					<TeamSelection />
					<span className="text-black-70">/</span>
					<Nav />
				</div>
				<div className="flex items-center gap-4">
					<UserButton />
				</div>
			</header>
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
