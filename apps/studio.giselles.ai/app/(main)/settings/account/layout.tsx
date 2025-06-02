import type { ReactNode } from "react";
import { SidebarMenu } from "./sidebar-menu";

export default function SettingsAccountLayout({
	children,
}: { children: ReactNode }) {
	return (
		<div className="h-full bg-black-900">
			<div className="px-[40px] flex-1 max-w-[1200px] mx-auto w-full flex min-h-[calc(100vh-64px)]">
				{/* Left Sidebar with border */}
				<div className="border-r border-black-80">
					<SidebarMenu />
				</div>
				{/* Main Content */}
				<div className="pl-[24px] flex-1 pt-[24px]">{children}</div>
			</div>
		</div>
	);
}
