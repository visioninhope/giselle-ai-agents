import type { ActId } from "@giselle-sdk/giselle";
import { Suspense } from "react";
import { giselleEngine } from "@/app/giselle-engine";
import { NavSkelton } from "./ui/nav-skelton";
import { Sidebar } from "./ui/sidebar";

export default async function ({
	children,
	params,
}: React.PropsWithChildren<{
	params: Promise<{ actId: ActId }>;
}>) {
	const { actId } = await params;
	const act = giselleEngine.getAct({ actId });
	return (
		<div className="bg-surface-background text-foreground h-screen flex font-sans">
			{/* Left Sidebar */}
			<Suspense fallback={<NavSkelton />}>
				<Sidebar act={act} />
			</Suspense>

			<main className="m-[8px] flex flex-1 border-[2px] border-border-variant rounded-[8px] bg-background overflow-hidden">
				{children}
			</main>
		</div>
	);
}
