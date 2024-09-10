"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";

export const Nav: FC = () => {
	const pathname = usePathname();

	return (
		<div className="gap-[16px] text-[18px] font-[Rosart] flex text-black-70">
			<p className="text-black--30">
				{pathname === "/"
					? "Lobby"
					: pathname === "/agents"
						? "Agents"
						: pathname === "/settings"
							? "Settings"
							: ""}
			</p>
			<p>/</p>
			{pathname !== "/" && <Link href="/">Lobby</Link>}
			{pathname !== "/agents" && <Link href="/agents">Agents</Link>}
			{pathname !== "/settings" && <Link href="/settings"> Settings</Link>}
		</div>
	);
};
