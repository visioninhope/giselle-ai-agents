"use client";

import { Button } from "@giselle-internal/ui/button";
import { GiselleIcon } from "@giselle-internal/workflow-designer-ui";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import clsx from "clsx/lite";
import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

export function Sidebar(props: React.PropsWithChildren) {
	const [open, setOpen] = useState(true);
	const toggleOpen = useCallback(() => setOpen(!open), [open]);
	return (
		<>
			<div
				className={clsx(
					"hidden md:block fixed top-0 left-0 h-full  bg-stage-background flex-col border-r border-white/10 transition-all duration-300 py-4 z-40",
					open ? "w-64 px-4" : "w-16 pl-4 pr-2",
				)}
			>
				<div className="mb-4 relative">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-[3px]">
							<GiselleIcon className="text-white-900 w-[24px] h-[24px]" />
							<span
								className={clsx(
									"text-white-900 text-[13px] font-semibold transition-all duration-300",
									open ? "opacity-100" : "opacity-0 w-0 overflow-hidden",
								)}
							>
								Stage
							</span>
						</div>
						<button
							type="button"
							onClick={toggleOpen}
							className="text-white-700 hover:text-white-900 transition-colors outline-none cursor-pointer"
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
				<nav>
					<div className="relative h-16">
						<div
							className={clsx(
								"flex items-center absolute inset-0 transition-opacity duration-500 overflow-hidden whitespace-nowrap",
								!open && "opacity-0",
							)}
						>
							<Button
								variant="glass"
								size="large"
								leftIcon={<SparklesIcon />}
								asChild
								className="w-full"
							>
								<Link href="/stage">
									<div
										className={clsx(
											"transition-opacity duration-500 overflow-hidden whitespace-nowrap",
											!open && "opacity-0",
										)}
									>
										New Task
									</div>
								</Link>
							</Button>
						</div>

						<div
							className={clsx(
								"flex items-center absolute inset-0 transition-opacity duration-500 overflow-hidden whitespace-nowrap opacity-0",
								!open && "opacity-100",
							)}
						>
							<Button variant="glass" size="large" asChild className="w-full">
								<Link href="/stage">
									<SparklesIcon className="size-[18px]" />
								</Link>
							</Button>
						</div>
					</div>
				</nav>
			</div>
			{/* Main content spacer */}
			<div
				className={clsx(
					"hidden md:block transition-all duration-300",
					open ? "w-64" : "w-16",
				)}
			/>
		</>
	);
}
