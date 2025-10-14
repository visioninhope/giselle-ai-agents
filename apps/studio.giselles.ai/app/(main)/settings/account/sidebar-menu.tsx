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
			className="min-h-full flex flex-col pt-0"
			style={{ width: "var(--spacing-navigation-rail-expanded)" }}
			aria-label="Account settings navigation"
		>
			<ul className="flex flex-col">
				{links.map((link) => (
					<li key={link.href}>
						<Link
							href={link.href}
							aria-label={`${link.label} settings`}
							className={cn(
								"text-sm font-sans font-medium rounded-lg px-2 py-0.5 transition-colors",
								"text-stage-sidebar-text hover:text-stage-sidebar-text-hover",
								{
									"text-stage-sidebar-text-hover": pathname === link.href,
								},
							)}
						>
							{link.label}
						</Link>
					</li>
				))}
			</ul>
		</nav>
	);
}
