"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
	{ href: "/settings/team/vector-stores/document", label: "Document" },
	{ href: "/settings/team/vector-stores", label: "GitHub" },
];

export function VectorStoresSidebarMenu() {
	const pathname = usePathname();
	const documentHref = "/settings/team/vector-stores/document";
	const githubHref = "/settings/team/vector-stores";
	const isDocumentPath =
		pathname === documentHref || pathname.startsWith(`${documentHref}/`);
	const activeHref = isDocumentPath ? documentHref : githubHref;

	return (
		<div className="w-[200px] min-h-full flex flex-col">
			<div className="flex flex-col space-y-2">
				{links.map((link) => {
					const isActive = link.href === activeHref;
					return (
						<Link
							key={link.href}
							href={link.href}
							aria-label={`${link.label} vector stores`}
							className={cn(
								"text-[16px] font-sans font-medium rounded-lg px-4 py-1 hover:bg-white/5",
								{
									"text-white-400": isActive,
									"text-black-70": !isActive,
								},
							)}
						>
							{link.label}
						</Link>
					);
				})}
			</div>
		</div>
	);
}
