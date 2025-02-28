import { settingsV2Flag } from "@/flags";
import { cn } from "@/lib/utils";
import { UserIcon, UsersIcon } from "lucide-react";
import type { ReactNode } from "react";
import { IntegrationIcon } from "./components/integration-icon";
import { MenuLink } from "./components/menu-link";

export default async function SettingLayout({
	children,
}: { children: ReactNode }) {
	const settingsV2Mode = await settingsV2Flag();

	return (
		<div className="flex divide-x divide-black-80 h-full">
			<div className="w-[200px] p-[24px]">
				<div className="grid gap-[16px]">
					<MenuLink
						href="/settings/account"
						icon={<UserIcon className="w-4 h-4" />}
					>
						Account
					</MenuLink>
					<MenuLink
						href="/settings/integration"
						icon={<IntegrationIcon className="w-4 h-4" />}
					>
						Integration
					</MenuLink>
					<MenuLink
						href="/settings/team"
						icon={<UsersIcon className="w-4 h-4" />}
					>
						Team
					</MenuLink>
				</div>
			</div>
			<div
				className={cn(
					"px-[48px] py-[32px] flex-1",
					settingsV2Mode && "px-[40px] py-[24px]",
				)}
			>
				{children}
			</div>
		</div>
	);
}
