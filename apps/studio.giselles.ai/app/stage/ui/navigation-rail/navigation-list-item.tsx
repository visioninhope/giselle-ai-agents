import Link from "next/link";
import type { NavigationItem } from "./navigation-items";

export function NavigationListItem(props: NavigationItem) {
	switch (props.type) {
		case "link":
			return (
				<Link
					href={props.href}
					className="text-text-muted text-sm flex items-center py-0.5 hover:bg-ghost-element-hover rounded-lg px-1"
				>
					<div className="size-8 flex items-center justify-center">
						<props.icon className="size-4" />
					</div>
					{props.label}
				</Link>
			);
		default: {
			const _exhaustiveCheck: never = props.type;
			throw new Error(`Unhandled type: ${_exhaustiveCheck}`);
		}
	}
}
