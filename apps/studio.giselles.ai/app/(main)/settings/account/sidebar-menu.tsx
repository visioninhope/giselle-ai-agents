"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SidebarMenu() {
	const pathname = usePathname();

	const links = [
		{ href: "/settings/account", label: "Overview" },
		{ href: "/settings/account/general", label: "General" },
		{ href: "/settings/account/authentication", label: "Authentication" },
	];

	return (
		<nav
			className="min-h-full flex flex-col pt-0 px-1.5"
			style={{ width: "248px" }}
			aria-label="Account settings navigation"
		>
			<ul className="flex flex-col">
				{links.map((link) => (
					<li key={link.href} className="w-full h-[36px]">
						<Link
							href={link.href}
							aria-label={`${link.label} settings`}
							className={cn(
								"text-sm font-sans font-medium rounded-lg px-1 transition-colors flex items-center w-full h-full",
								"text-stage-sidebar-text hover:text-stage-sidebar-text-hover",
								{
									"text-stage-sidebar-text-hover": pathname === link.href,
								},
							)}
						>
							<span className="w-8 shrink-0" aria-hidden="true" />
							{link.label}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}
