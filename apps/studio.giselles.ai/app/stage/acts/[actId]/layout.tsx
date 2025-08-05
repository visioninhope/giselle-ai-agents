import type { ActId } from "@giselle-sdk/giselle";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { giselleEngine } from "@/app/giselle-engine";
import { Nav } from "./ui/nav";
import { NavV2 } from "./ui/nav-v2";
import { NavSkelton } from "./ui/nav-skelton";

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
				<NavV2 act={act} />
			</Suspense>

			<main className="m-[8px] flex flex-1 border-[2px] border-border-variant rounded-[8px] bg-background overflow-hidden">
				{children}
			</main>
		</div>
	);
}
