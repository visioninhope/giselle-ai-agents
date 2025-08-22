import { DropdownMenu } from "@giselle-internal/ui/dropdown-menu";
import Link from "next/link";
import { use } from "react";
import { AvatarImage } from "@/services/accounts/components/user-button/avatar-image";
import { SignOutButton } from "@/services/accounts/components/user-button/sign-out-button";
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
				{
					value: "link-to-acctount-settings",
					label: "Account settings",
					href: "/settings/account",
				},
				{ value: "link-to-lobby", label: "Lobby", href: "/apps" },
				{
					value: "link-to-homepage",
					label: "Home page",
					href: "https://giselles.ai",
					external: true,
				},
				{
					value: "link-to-docs",
					label: "Docs",
					href: "https://docs.giselles.ai/guides/introduction",
					external: true,
				},
				{ value: "log-out", label: "Log out" },
			]}
			renderItem={(item) => {
				if (item.href !== undefined) {
					if (item.external) {
						return (
							<a
								href={item.href}
								target="_blank"
								rel="noopener"
								className="w-full"
							>
								{item.label}
							</a>
						);
					}
					return (
						<Link href={item.href} className="w-full">
							{item.label}
						</Link>
					);
				}
				if (item.value === "log-out") {
					return <SignOutButton>Log out</SignOutButton>;
				}
				console.warn("Unknown item value:", item.value);
				return item.label;
			}}
			widthClassName={
				variant === "expanded"
					? "w-[var(--radix-dropdown-menu-trigger-width)]"
					: ""
			}
			align={variant === "expanded" ? "center" : "start"}
			trigger={
				<button
					className="w-full hover:bg-ghost-element-hover h-full rounded-md cursor-pointer outline-none p-1.5 flex items-center"
					type="button"
				>
					<div className="size-8 flex items-center justify-center shrink-0">
						<AvatarImage
							className="rounded-full"
							avatarUrl={user.avatarUrl ?? null}
							width={24}
							height={24}
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
