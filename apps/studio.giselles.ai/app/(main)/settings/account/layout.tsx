import type { ReactNode } from "react";
import { SidebarMenu } from "./sidebar-menu";

export default function SettingsAccountLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<div className="h-full bg-surface">
			<div className="flex-1 max-w-[1200px] w-full flex min-h-[calc(100vh-64px)] pl-[40px]">
				{/* Left Sidebar with border */}
				<div className="border-r border-border-muted pr-6">
					<div className="sticky top-[64px]">
						<SidebarMenu />
					</div>
				</div>
				{/* Main Content */}
				<div className="pl-[24px] flex-1 pt-[24px]">{children}</div>
			</div>
		</div>
	);
}
