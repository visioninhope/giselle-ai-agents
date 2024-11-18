import { GiselleLogo } from "@/components/giselle-logo";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { UserButton } from "@/services/accounts/components";
import Link from "next/link";
import type { ReactNode } from "react";
import { Nav } from "./nav";

export default function Layout({ children }: { children: ReactNode }) {
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
					<Select defaultValue="team-1">
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select Team" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="team-1">Giselle Team</SelectItem>
							<SelectItem value="team-2">AI Research Team</SelectItem>
							<SelectItem value="team-3">Development Team</SelectItem>
							<div className="px-2 py-2 border-t border-black-80">
								<Link
									href="/teams/new"
									className="flex items-center text-sm text-blue-500 hover:text-blue-400"
								>
									+ Create New Team
								</Link>
							</div>
						</SelectContent>
					</Select>
					<UserButton />
				</div>
			</header>
			<main className="flex-1 overflow-y-auto">{children}</main>
		</div>
	);
}
