import clsx from "clsx/lite";
import type { NavigationRailState } from "./types";

export function NavigationRailContainer({
	children,
	variant,
}: React.PropsWithChildren<{ variant: NavigationRailState }>) {
	return (
		<div
			className={clsx(
				"h-full border-r border-white/10 flex-col transition-all duration-300",
				variant === "collapsed" && "w-navigation-rail-collapsed",
				variant === "expanded" && "w-navigation-rail-expanded",
			)}
		>
			<div
				className={clsx(
					variant === "collapsed" && "w-navigation-rail-collapsed",
					variant === "expanded" && "w-navigation-rail-expanded",
				)}
			>
				{children}
			</div>
		</div>
	);
}
