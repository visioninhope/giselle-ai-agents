import { Button } from "@giselle-internal/ui/button";
import { StatusBadge } from "@giselle-internal/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@giselle-internal/ui/table";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccountInfo } from "@/app/(main)/settings/account/actions";
import { giselleEngine } from "@/app/giselle-engine";
import { type acts as actsSchema, db } from "@/drizzle";
import { stageFlag } from "@/flags";
import { fetchCurrentUser } from "@/services/accounts";
import { fetchUserTeams } from "@/services/teams";
import { StageSidebar } from "../ui/stage-sidebar";

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
  revalidatePath("/stage/acts");
}

export default async function ActsPage() {
  const enableStage = await stageFlag();
  if (!enableStage) {
    return notFound();
  }

  const teams = await fetchUserTeams();
  const user = await fetchCurrentUser();
  const accountInfo = await getAccountInfo();
  const dbActs = await db.query.acts.findMany({
    where: (acts, { eq }) => eq(acts.directorDbId, user.dbId),
    orderBy: (acts, { desc }) => [desc(acts.createdAt)],
  });
  const acts = await Promise.all(
    dbActs.map((dbAct) => enrichActWithNavigationData(dbAct, teams)),
  ).then((tmp) => tmp.filter((actOrNull) => actOrNull !== null));

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
        <div className="space-y-6 py-6 min-h-full">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-[30px] font-sans font-medium text-[hsl(192,73%,84%)]"
                style={{
                  textShadow:
                    "0 0 20px #0087f6, 0 0 40px #0087f6, 0 0 60px #0087f6",
                }}
              >
                Tasks
              </h1>
              <p className="text-[14px] text-black-600 mt-1">
                View and manage all your tasks
              </p>
            </div>
            <div className="flex items-center gap-3">
              <form action={reloadPage}>
                <Button type="submit" variant="subtle" size="compact">
                  Reload
                </Button>
              </form>
              <Button type="button" variant="subtle" size="compact">
                Archive
              </Button>
            </div>
          </div>

          <div className="bg-black-900 rounded-lg border border-gray-800">
            <Table className="w-full">
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="text-white-100">Workspace</TableHead>
                  <TableHead className="text-center w-24 text-white-100">
                    Status
                  </TableHead>
                  <TableHead className="text-right w-20 text-white-100">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {acts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-12 text-black-600"
                    >
                      No tasks found
                    </TableCell>
                  </TableRow>
                ) : (
                  acts.map((act) => (
                    <TableRow
                      key={act.id}
                      className="hover:bg-white/5 transition-colors duration-200 border-gray-800"
                    >
                      <TableCell className="w-12 !p-0 !m-0">
                        <div className="w-10 h-10 bg-gray-600 rounded-md flex items-center justify-center ml-4">
                          <span className="text-xs text-gray-400">App</span>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[240px]">
                        <div className="flex flex-col">
                          <span className="truncate text-white-100">
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
                          <Link
                            href={act.link}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            More {">"}
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
