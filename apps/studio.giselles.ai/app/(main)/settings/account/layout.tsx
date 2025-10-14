import type { ReactNode } from "react";
import { SidebarMenu } from "./sidebar-menu";

export default function SettingsAccountLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<div className="h-full bg-bg">
			<div className="w-full flex min-h-[calc(100vh-64px)]">
				{/* Left Sidebar with border */}
				<div className="border-r border-border">
					<div className="sticky top-[20px]">
						<SidebarMenu />
					</div>
				</div>
				{/* Main Content */}
				<div className="p-[24px] flex-1">{children}</div>
			</div>
		</div>
	);
}
