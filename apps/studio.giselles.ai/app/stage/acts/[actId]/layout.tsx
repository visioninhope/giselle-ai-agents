import {
	isTriggerNode,
	type ManualTriggerParameter,
} from "@giselle-sdk/data-type";
import type { ActId } from "@giselle-sdk/giselle";
import { Suspense } from "react";
import { giselleEngine } from "@/app/giselle-engine";

import { fetchUserTeams } from "@/services/teams";
import { NavSkelton } from "./ui/nav-skelton";
import { Sidebar } from "./ui/sidebar";
import "./mobile-scroll.css";

export default async function ({
	children,
	params,
}: React.PropsWithChildren<{
	params: Promise<{ actId: ActId }>;
}>) {
	const { actId } = await params;
	const act = await giselleEngine.getAct({ actId });

	// Get workspace and app information
	let appName = "Untitled App";
	let teamName = "Personal Team";
	let triggerParameters: ManualTriggerParameter[] = [];

	try {
		if (act.workspaceId) {
			const workspace = await giselleEngine.getWorkspace(act.workspaceId, true);
			appName = workspace?.name || "Untitled App";

			// Get trigger node parameters for field labels
			const triggerNode = workspace?.nodes.find((node) => isTriggerNode(node));
			if (
				triggerNode &&
				triggerNode.content.provider === "manual" &&
				triggerNode.content.state.status === "configured"
			) {
				try {
					const flowTrigger = await giselleEngine.getTrigger({
						flowTriggerId: triggerNode.content.state.flowTriggerId,
					});
					if (flowTrigger?.configuration.provider === "manual") {
						triggerParameters =
							flowTrigger.configuration.event.parameters || [];
					}
				} catch (error) {
					console.warn("Failed to fetch flow trigger:", error);
				}
			}

			// Get team information
			const teams = await fetchUserTeams();
			// For now, use the first team or default to Personal Team
			teamName = teams[0]?.name || "Personal Team";
		}
	} catch (error) {
		console.warn("Failed to fetch app or team information:", error);
	}

	return (
		<div className="bg-[var(--color-stage-background)] text-foreground min-h-screen md:h-screen md:flex md:flex-row font-sans">
			{/* Left Sidebar - Always visible */}
			<div className="w-full md:w-auto md:h-screen md:overflow-y-auto">
				<Suspense fallback={<NavSkelton />}>
					<Sidebar
						act={Promise.resolve(act)}
						appName={appName}
						teamName={teamName}
						triggerParameters={triggerParameters}
					/>
				</Suspense>
			</div>

			{/* Main Content - Hidden on mobile */}
			<main className="hidden md:flex m-0 md:m-[8px] flex-1 rounded-none md:rounded-[12px] backdrop-blur-md border-0 md:border md:border-white/20 shadow-lg shadow-black/10 shadow-inner overflow-hidden">
				{children}
			</main>
		</div>
	);
}
