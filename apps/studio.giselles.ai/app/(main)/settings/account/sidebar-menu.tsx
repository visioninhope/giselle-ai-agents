"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarMenu() {
	const pathname = usePathname();

	const links = [
		{ href: "/settings/account", label: "Overview" },
		{ href: "/settings/account/general", label: "General" },
		{ href: "/settings/account/authentication", label: "Authentication" },
	];

	return (
		<div className="w-[240px] min-h-full flex flex-col pt-0">
			<div className="flex flex-col space-y-4">
				{links.map((link) => (
					<Link
						key={link.href}
						href={link.href}
						className={`${
							pathname === link.href ? "text-white-400" : "text-black-70"
						} text-[16px] font-sans font-medium py-1`}
					>
						{link.label}
					</Link>
				))}
			</div>
		</div>
	);
}
