"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC } from "react";

// メニュー項目を配列として定義
const menuItems = [
	{ name: "Apps", path: "/apps" },
	{ name: "Docs", path: "https://docs.giselles.ai/guides/introduction", isExternal: true },
	{ name: "Settings", path: "/settings/team" },
];

export const Nav: FC = () => {
	const pathname = usePathname();

	return (
		<div className="flex items-center gap-4">
			{menuItems.map((item) => {
				const isActive = 
					!item.isExternal && (
						item.path === "/" 
							? pathname === "/"
							: pathname.startsWith(item.path)
					);
				
				return (
					<Link 
						key={item.path}
						href={item.path}
						className={`text-[14px] font-hubot font-medium transition-colors px-2 py-1 relative
							${isActive 
								? "text-primary-200" 
								: "text-black-70 hover:text-white-100 hover:after:content-[''] hover:after:absolute hover:after:left-0 hover:after:right-0 hover:after:bottom-0 hover:after:h-[2px] hover:after:bg-black-400"
							}`}
						{...(item.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
					>
						{item.name}
					</Link>
				);
			})}
		</div>
	);
};
