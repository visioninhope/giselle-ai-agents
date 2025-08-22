import { DropdownMenu } from "@giselle-internal/ui/dropdown-menu";
import { use } from "react";
import { AvatarImage } from "@/services/accounts/components/user-button/avatar-image";
import type { NavigationRailState, UserDataForNavigationRail } from "./types";

export function NavigationRailFooterMenu({
	user: userPromise,
	variant,
}: {
	user: Promise<UserDataForNavigationRail>;
	variant: NavigationRailState;
}) {
	const user = use(userPromise);
	return (
		<DropdownMenu
			items={[
				{ value: 1, label: "apple" },
				{ value: 2, label: "banana" },
				{ value: 3, label: "melon" },
			]}
			trigger={
				<button
					className="w-full hover:bg-ghost-element-hover h-full rounded-md cursor-pointer outline-none p-1.5 flex items-center"
					type="button"
				>
					<div className="size-8 flex items-center justify-center shrink-0">
						<AvatarImage
							className="size-6 rounded-full"
							avatarUrl={user.avatarUrl ?? null}
							width={32}
							height={32}
							alt={user.displayName || user.email || "User"}
						/>
					</div>
					{variant === "expanded" && (
						<p className="truncate text-text-muted text-sm">
							{user.displayName ?? user.email}
						</p>
					)}
				</button>
			}
		/>
	);
}
