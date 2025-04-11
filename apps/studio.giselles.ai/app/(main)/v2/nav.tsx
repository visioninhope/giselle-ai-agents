"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";

// Define menu items as an array
const menuItems = [
	{ name: "Apps", path: "/apps" },
	{
		name: "Docs",
		path: "https://docs.giselles.ai/guides/introduction",
		isExternal: true,
	},
	{ name: "Settings", path: "/settings/team" },
];

export const Nav: FC = () => {
	const pathname = usePathname();

	return (
		<div className="flex items-center gap-1">
			{menuItems.map((item) => {
				const isActive =
					!item.isExternal &&
					(item.path === "/"
						? pathname === "/"
						: pathname === item.path || pathname.startsWith(`${item.path}/`));

				return (
					<Link
						key={item.path}
						href={item.path}
						className={`text-[16px] font-hubot font-medium transition-colors px-2 py-1.5 relative rounded-md
							${
								isActive
									? "text-primary-100 after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[2px] after:bg-primary-100"
									: "text-black-70 hover:text-white-100 hover:bg-white-950/20"
							}`}
						{...(item.isExternal
							? { target: "_blank", rel: "noopener noreferrer" }
							: {})}
					>
						{item.name}
					</Link>
				);
			})}
		</div>
	);
};
