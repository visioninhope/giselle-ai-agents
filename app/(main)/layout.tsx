import { GiselleLogo } from "@/components/giselle-logo";
import type { ReactNode } from "react";
import { Nav } from "./nav";

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<div className="h-screen overflow-y-hidden bg-black-100 divide-y divide-black-80">
			<header className="h-[60px] flex items-center px-[24px]">
				<GiselleLogo className="w-[70px] h-auto fill-white mt-[4px] mr-[8px]" />
				<Nav />
			</header>
			<main>{children}</main>
		</div>
	);
}
