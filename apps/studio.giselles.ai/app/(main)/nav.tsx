"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";

export const Nav: FC = () => {
	const pathname = usePathname();

	return (
		<div className="gap-[8px] text-[18px] font-hubot font-medium flex text-primary-100">
			<p className="text-black--30">
				{pathname === "/"
					? "Lobby"
					: pathname.startsWith("/apps")
						? "Apps"
						: pathname.startsWith("/settings")
							? "Settings"
							: ""}
			</p>
			<p>/</p>
			{/** pathname !== "/" && <Link href="/">Lobby</Link> */}
			{!pathname.startsWith("/apps") && <Link href="/apps" className="px-1">Apps</Link>}
			{!pathname.startsWith("/settings") && (
				<Link href="/settings/account" className="px-1">Settings</Link>
			)}
		</div>
	);
};
