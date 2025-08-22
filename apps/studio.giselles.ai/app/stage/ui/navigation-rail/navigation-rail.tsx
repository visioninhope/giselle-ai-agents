"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { NavigationRailCollapsed } from "./navigation-rail-collapsed";
import { NavigationRailExpanded } from "./navigation-rail-expanded";
import type { NavigationRailState } from "./types";

export function NavigationRail() {
	const [state, setState] = useState<NavigationRailState>("expanded");
	const spacingAnimationControls = useMemo(() => {
		switch (state) {
			case "collapsed":
				return {
					width: "var(--spacing-navigation-rail-collapsed)",
				};
			case "expanded":
				return {
					width: "var(--spacing-navigation-rail-expanded)",
				};
			default: {
				const _exhaustiveCheck: never = state;
				throw new Error(`Unhandled state: ${_exhaustiveCheck}`);
			}
		}
	}, [state]);
	return (
		<>
			<AnimatePresence>
				{state === "expanded" && (
					<motion.div
						className="hidden md:block fixed top-0 left-0 h-full"
						exit={{
							opacity: 0,
							width: "var(--spacing-navigation-rail-collapsed)",
						}}
						initial={{
							opacity: 0,
							width: "var(--spacing-navigation-rail-collapsed)",
						}}
						animate={{
							opacity: 1,
							width: "var(--spacing-navigation-rail-expanded)",
						}}
					>
						<NavigationRailExpanded
							onCollapsedButtonClick={() => setState("collapsed")}
						/>
					</motion.div>
				)}
			</AnimatePresence>
			<AnimatePresence>
				{state === "collapsed" && (
					<motion.div
						className="hidden md:block fixed top-0 left-0 h-full"
						initial={{
							opacity: 0,
							width: "var(--spacing-navigation-rail-collapsed)",
						}}
						exit={{
							opacity: 0,
							width: "var(--spacing-navigation-rail-collapsed)",
						}}
						animate={{
							opacity: 1,
							width: "var(--spacing-navigation-rail-collapsed)",
						}}
					>
						<NavigationRailCollapsed
							onExpandedButtonClick={() => setState("expanded")}
						/>
					</motion.div>
				)}
			</AnimatePresence>
			<motion.div animate={spacingAnimationControls} />
		</>
	);
}
