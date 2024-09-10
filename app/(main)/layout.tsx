import { GiselleLogo } from "@/components/giselle-logo";
import Link from "next/link";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<div className="h-screen overflow-y-hidden bg-black-100 divide-y divide-black-80">
			<header className="h-[60px] flex items-center px-[24px]">
				<GiselleLogo className="w-[70px] h-auto fill-white mt-[4px] mr-[8px]" />
				<div className="gap-[16px] text-[18px] font-[Rosart] flex text-black-70">
					<p className="text-black--30">Settings</p>
					<p>/</p>
					<Link href="/">Lobby</Link>
					<Link href="/">Playground</Link>
					<Link href="/">Agents</Link>
				</div>
			</header>
			<main>{children}</main>
		</div>
	);
}
