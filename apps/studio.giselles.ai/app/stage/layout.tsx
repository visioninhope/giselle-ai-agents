import { type ReactNode, Suspense } from "react";
import { getSidebarData } from "./query";
import { StageSidebar } from "./ui/stage-sidebar";

export default function StageLayout({ children }: { children: ReactNode }) {
	const data = getSidebarData();
	return (
		<div className="flex h-screen bg-black-900">
			<Suspense fallback="">
				<StageSidebar data={data} />
				<div className="flex-1 h-full">{children}</div>
			</Suspense>
		</div>
	);
}
