"use client";

import { GiselleIcon } from "@giselle-internal/workflow-designer-ui";
import { BellIcon, ChevronLeftIcon } from "@radix-ui/react-icons";
import clsx from "clsx/lite";
import { useCallback, useState } from "react";

export function Sidebar(props: React.PropsWithChildren) {
	const [open, setOpen] = useState(true);
	const toggleOpen = useCallback(() => setOpen(!open), [open]);
	return (
		<>
			<div className="md:hidden fixed top-0 left-0 right-0 bg-[var(--color-stage-background)] border-b border-white/10 px-4 py-3 z-50">
				<div className="flex items-center justify-between">
					{/* Left side: G icon + Stage */}
					<div className="flex items-center gap-2">
						<GiselleIcon className="text-white-900 w-6 h-6" />
						<span className="text-white-900 text-lg font-semibold">Stage</span>
					</div>

					{/* Right side: Icons */}
					<div className="flex items-center gap-4">
						<button
							type="button"
							className="text-white-700 hover:text-white-900 transition-colors"
						>
							<BellIcon className="w-5 h-5" />
						</button>
					</div>
				</div>
			</div>

			<div
				className={clsx(
					"hidden md:flex h-screen bg-stage-background flex-col border-r border-white/10 transition-all duration-300 py-4",
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
			</div>
		</>
	);
}
