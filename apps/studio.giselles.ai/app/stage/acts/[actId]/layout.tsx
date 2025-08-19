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
    <div className="bg-[var(--color-stage-background)] text-foreground h-screen flex font-sans">
      {/* Left Sidebar */}
      <Suspense fallback={<NavSkelton />}>
        <Sidebar
          act={Promise.resolve(act)}
          appName={appName}
          teamName={teamName}
          triggerParameters={triggerParameters}
        />
      </Suspense>

      <main className="m-[8px] flex flex-1 rounded-[12px] backdrop-blur-md border border-white/20 shadow-lg shadow-black/10 shadow-inner overflow-hidden">
        {children}
      </main>
    </div>
  );
}
