import type { ReactNode } from "react";
import { SidebarMenu } from "./sidebar-menu";

export default async function SettingsAccountLayout({
	children,
}: { children: ReactNode }) {
	return (
		<div className="h-full bg-black-900">
			<div className="px-[40px] pb-[24px] flex-1 max-w-[1200px] mx-auto w-full flex divide-x divide-black-80">
				{/* Left Sidebar */}
				<SidebarMenu />
				{/* Main Content */}
				<div className="pl-[24px] flex-1 pt-[24px]">{children}</div>
			</div>
		</div>
	);
}
