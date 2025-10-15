"use client";

import clsx from "clsx/lite";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLink(
	props: React.PropsWithChildren<{
		pathname: string;
	}>,
) {
	const pathname = usePathname();

	return (
		<Link
			className={clsx(
				"w-full text-left px-3 py-2 rounded-[4px] text-sm font-medium transition-colors hover:bg-ghost-element-hover",
				"data-[state=active]:text-text data-[state=active]:bg-ghost-element-selected",
			)}
			href={props.pathname}
			data-state={pathname === props.pathname ? "active" : ""}
		>
			{props.children}
		</Link>
	);
}
