"use client";

import { Button } from "@giselle-internal/ui/button";
import { GiselleIcon, WilliIcon } from "@giselle-internal/workflow-designer-ui";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import clsx from "clsx/lite";
import { LibraryIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { TinySidebar } from "./tiny-sidebar";
import {
	links,
	sidebarWidthClassName,
	tinySidebarWidthClassName,
} from "./variable";

export function Sidebar(props: React.PropsWithChildren) {
	const [open, setOpen] = useState(true);
	const toggleOpen = useCallback(() => setOpen(!open), [open]);
	const pathname = usePathname();

	return (
		<>
			<TinySidebar show={!open} onOpenButtonClick={() => setOpen(true)} />
			<div
				className={clsx(
					"hidden md:block fixed top-0 left-0 h-full border-r border-white/10 flex-col transition-all duration-300 py-4",
					open
						? sidebarWidthClassName
						: `${tinySidebarWidthClassName} opacity-0`,
				)}
			>
				<div className="mb-4 relative ">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-[3px]">
							<GiselleIcon className="text-white-900 w-[24px] h-[24px]" />
							<span className="text-white-900 text-[13px] font-semibold">
								Stage
							</span>
						</div>
						<button
							type="button"
							onClick={toggleOpen}
							className="absolute text-white-700 hover:text-white-900 transition-colors outline-none cursor-pointer right-1"
						>
							<ChevronLeftIcon
								className={clsx(
									"w-4 h-4 transition-transform duration-300",
									!open && "rotate-180",
								)}
							/>
						</button>
					</div>
				</div>
				<nav className="flex flex-col gap-4">
					<Button
						variant="glass"
						size="large"
						leftIcon={<SparklesIcon />}
						asChild
						className="w-full"
					>
						<Link href="/stage">New Task</Link>
					</Button>
					{links.map((link) => (
						<div className="relative group" key={link.href}>
							<Link href={link.href}>
								<div
									className={clsx(
										"w-full flex flex-row items-center justify-start gap-1 pl-2",
										link.isActive(pathname)
											? "text-white-900"
											: "text-text-nav-inactive hover:text-text-nav-active",
									)}
								>
									{link.icon && (
										<link.icon className="size-[18px] flex-shrink-0" />
									)}
									<div className="truncate text-sm whitespace-nowrap w-full">
										<span
											className={clsx(
												"ml-2 transition-opacity duration-500 overflow-hidden whitespace-nowrap",
											)}
										>
											{link.label}
										</span>
									</div>
								</div>
							</Link>
						</div>
					))}
				</nav>
			</div>
			{/* Main content spacer */}
			<div
				className={clsx(
					"hidden md:block transition-all duration-300",
					open ? sidebarWidthClassName : tinySidebarWidthClassName,
				)}
			/>
		</>
	);
}
