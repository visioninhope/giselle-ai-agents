import { Button } from "@giselle-internal/ui/button";
import { StatusBadge } from "@giselle-internal/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@giselle-internal/ui/table";
import {
  isTriggerNode,
  type Workspace,
  type WorkspaceId,
} from "@giselle-sdk/data-type";
import { defaultName } from "@giselle-sdk/giselle";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { getAccountInfo } from "@/app/(main)/settings/account/actions";
import { giselleEngine } from "@/app/giselle-engine";
import { acts as actsSchema, db } from "@/drizzle";
import { stageFlag } from "@/flags";
import { fetchCurrentUser } from "@/services/accounts";
import { fetchUserTeams } from "@/services/teams";
import { type FlowTriggerUIItem, Form } from "./form";
import { ReloadButton } from "./reload-button";
import { ResizableLayout } from "./resizable-layout";
import { StageSidebar } from "./stage-sidebar";

// The maximum duration of server actions on this page is extended to 800 seconds through enabled fluid compute.
// https://vercel.com/docs/functions/runtimes#max-duration
export const maxDuration = 800;

// This feature is currently under development and data structures change destructively,
// so parsing of legacy data frequently fails. We're using a rough try-catch to ignore
// data that fails to parse. This should be properly handled when the feature flag is removed.
async function enrichActWithNavigationData(
  act: typeof actsSchema.$inferSelect,
  teams: { dbId: number; name: string }[],
) {
  try {
    const tmpAct = await giselleEngine.getAct({ actId: act.sdkActId });
    const team = teams.find((t) => t.dbId === act.teamDbId);
    if (team === undefined) {
      throw new Error("Team not found");
    }
    const tmpWorkspace = await giselleEngine.getWorkspace(
      act.sdkWorkspaceId,
      true,
    );

    const findStepByStatus = (status: string) => {
      for (const sequence of tmpAct.sequences) {
        for (const step of sequence.steps) {
          if (step.status === status) {
            return step;
          }
        }
      }
      return null;
    };

    const getFirstStep = () => {
      if (tmpAct.sequences.length === 0) {
        return null;
      }
      const firstSequence = tmpAct.sequences[0];
      if (firstSequence.steps.length === 0) {
        return null;
      }
      return firstSequence.steps[0];
    };

    const getLastStep = () => {
      if (tmpAct.sequences.length === 0) {
        return null;
      }
      const lastSequence = tmpAct.sequences[tmpAct.sequences.length - 1];
      if (lastSequence.steps.length === 0) {
        return null;
      }
      return lastSequence.steps[lastSequence.steps.length - 1];
    };

    let link = `/stage/acts/${tmpAct.id}`;
    let targetStep = null;

    switch (tmpAct.status) {
      case "inProgress":
        targetStep = findStepByStatus("running") ?? getFirstStep();
        break;
      case "completed":
        targetStep = getLastStep();
        break;
      case "cancelled":
        targetStep = findStepByStatus("cancelled");
        break;
      case "failed":
        targetStep = findStepByStatus("failed");
        break;
      default: {
        const _exhaustiveCheck: never = tmpAct.status;
        throw new Error(`Unhandled status: ${_exhaustiveCheck}`);
      }
    }

    if (targetStep) {
      link += `/${targetStep.id}`;
    }
    return {
      ...tmpAct,
      link,
      teamName: team.name,
      workspaceName: tmpWorkspace.name ?? "Untitled",
    };
  } catch {
    return null;
  }
}

async function reloadPage() {
  "use server";
  await Promise.resolve();
  revalidatePath("/stage");
}

export default async function StagePage() {
  const enableStage = await stageFlag();
  if (!enableStage) {
    return notFound();
  }
  const teams = await fetchUserTeams();
  const teamOptions = teams.map((team) => ({
    value: team.id,
    label: team.name,
  }));
  const user = await fetchCurrentUser();
  const accountInfo = await getAccountInfo();
  const dbActs = await db.query.acts.findMany({
    where: (acts, { eq }) => eq(acts.directorDbId, user.dbId),
    orderBy: (acts, { desc }) => [desc(acts.createdAt)],
    limit: 10,
  });
  const acts = await Promise.all(
    dbActs.map((dbAct) => enrichActWithNavigationData(dbAct, teams)),
  ).then((tmp) => tmp.filter((actOrNull) => actOrNull !== null));
  const flowTriggers: Array<FlowTriggerUIItem> = [];
  for (const team of teams) {
    const tmpFlowTriggers = await db.query.flowTriggers.findMany({
      where: (flowTriggers, { eq }) => eq(flowTriggers.teamDbId, team.dbId),
    });
    const workspaceMap: Map<WorkspaceId, Workspace> = new Map();
    for (const tmpFlowTrigger of tmpFlowTriggers) {
      if (!workspaceMap.has(tmpFlowTrigger.sdkWorkspaceId)) {
        const tmpWorkspace = await giselleEngine.getWorkspace(
          tmpFlowTrigger.sdkWorkspaceId,
          true,
        );
        workspaceMap.set(tmpFlowTrigger.sdkWorkspaceId, tmpWorkspace);
      }
      const workspace = workspaceMap.get(tmpFlowTrigger.sdkWorkspaceId);
      if (workspace === undefined) {
        continue;
      }
      const node = workspace.nodes.find(
        (node) =>
          isTriggerNode(node) &&
          node.content.state.status === "configured" &&
          node.content.state.flowTriggerId === tmpFlowTrigger.sdkFlowTriggerId,
      );
      if (node === undefined) {
        continue;
      }
      const flowTrigger = await giselleEngine.getTrigger({
        flowTriggerId: tmpFlowTrigger.sdkFlowTriggerId,
      });
      if (flowTrigger === undefined) {
        continue;
      }
      flowTriggers.push({
        id: tmpFlowTrigger.sdkFlowTriggerId,
        teamId: team.id,
        label: node.name ?? defaultName(node),
        workspaceName: workspace.name ?? "Untitled",
        sdkData: flowTrigger,
      });
    }
  }
  return (
    <div className="flex min-h-screen bg-black-900">
      <StageSidebar
        user={{
          displayName: accountInfo.displayName ?? undefined,
          email: accountInfo.email ?? undefined,
          avatarUrl: accountInfo.avatarUrl ?? undefined,
        }}
      />
      <div className="flex-1 px-[24px] bg-[var(--color-stage-background)] pt-16 md:pt-0 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 overflow-y-auto">
        <ResizableLayout
          mainContent={
            <div className="space-y-6 py-6 min-h-full">
              <div className="text-center text-[24px] font-mono font-light text-white-100 bg-transparent">
                What are we perform next ?
              </div>
              <Form
                teamOptions={teamOptions}
                flowTriggers={flowTriggers}
                performStageAction={async (payloads) => {
                  "use server";

                  const user = await fetchCurrentUser();
                  const { act } = await giselleEngine.createAct({
                    workspaceId: payloads.flowTrigger.workspaceId,
                    nodeId: payloads.flowTrigger.nodeId,
                    inputs: [
                      {
                        type: "parameters",
                        items: payloads.parameterItems,
                      },
                    ],
                    generationOriginType: "stage",
                  });

                  const team = await db.query.teams.findFirst({
                    where: (teams, { eq }) => eq(teams.id, payloads.teamId),
                  });
                  if (team === undefined) {
                    throw new Error("Team not found");
                  }
                  await db.insert(actsSchema).values({
                    teamDbId: team.dbId,
                    directorDbId: user.dbId,
                    sdkActId: act.id,
                    sdkFlowTriggerId: payloads.flowTrigger.id,
                    sdkWorkspaceId: payloads.flowTrigger.workspaceId,
                  });
                  after(() =>
                    giselleEngine.startAct({
                      actId: act.id,
                    }),
                  );
                  revalidatePath("/stage");
                }}
              />
            </div>
          }
          actsContent={
            <div className="space-y-4 py-6 h-full">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[16px] font-sans text-white-100">Tasks</h2>
                <div className="flex items-center gap-3">
                  <ReloadButton reloadAction={reloadPage} />
                  <Button type="button" variant="subtle">
                    Archive
                  </Button>
                </div>
              </div>
              <Table className="table-fixed w-full">
                <TableBody>
                  {acts.map((act) => {
                    return (
                      <TableRow
                        key={act.id}
                        className="hover:bg-white/5 transition-colors duration-200"
                      >
                        <TableCell className="w-12 !p-0 !m-0">
                          <div className="w-10 h-10 bg-gray-600 rounded-md flex items-center justify-center">
                            <span className="text-xs text-gray-400">App</span>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[240px]">
                          <div className="flex flex-col">
                            <span className="truncate">
                              {act.workspaceName}
                            </span>
                            <span className="text-[12px] text-black-600 truncate">
                              {new Date(act.createdAt).toLocaleString()} ·{" "}
                              {act.teamName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center w-24">
                          {act.status === "inProgress" && (
                            <StatusBadge status="info" variant="dot">
                              Running
                            </StatusBadge>
                          )}
                          {act.status === "completed" && (
                            <StatusBadge status="success" variant="dot">
                              Completed
                            </StatusBadge>
                          )}
                          {act.status === "failed" && (
                            <StatusBadge status="error" variant="dot">
                              Failed
                            </StatusBadge>
                          )}
                          {act.status === "cancelled" && (
                            <StatusBadge status="ignored" variant="dot">
                              Cancelled
                            </StatusBadge>
                          )}
                        </TableCell>
                        <TableCell className="text-right w-20">
                          <div className="flex justify-end">
                            <Link href={act.link}>More {">"}</Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          }
        />
      </div>
    </div>
  );
}
