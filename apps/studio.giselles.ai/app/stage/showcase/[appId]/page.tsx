import { count, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { acts, agents, db, teams, users } from "@/drizzle";

import { AppDetailClient } from "./app-detail-client";

interface AppDetailPageProps {
  params: Promise<{
    appId: string;
  }>;
}

async function getAppDetails(appId: string) {
  try {
    // Get agent with team information
    const agentWithTeam = await db
      .select({
        id: agents.id,
        name: agents.name,
        updatedAt: agents.updatedAt,
        workspaceId: agents.workspaceId,
        createdAt: agents.createdAt,
        teamName: teams.name,
        teamId: teams.id,
        creatorName: users.displayName,
        creatorAvatarUrl: users.avatarUrl,
      })
      .from(agents)
      .leftJoin(teams, eq(agents.teamDbId, teams.dbId))
      .leftJoin(users, eq(agents.creatorDbId, users.dbId))
      .where(eq(agents.id, appId as any))
      .limit(1);

    if (!agentWithTeam[0]) {
      return null;
    }

    const agentData = agentWithTeam[0];

    // Get execution statistics
    const [executionStats] = agentData.workspaceId
      ? await db
          .select({
            totalExecutions: count(acts.dbId),
          })
          .from(acts)
          .where(eq(acts.sdkWorkspaceId, agentData.workspaceId))
      : [{ totalExecutions: 0 }];

    // Get recent executions for status determination
    const recentExecutions = agentData.workspaceId
      ? await db
          .select({
            createdAt: acts.createdAt,
          })
          .from(acts)
          .where(eq(acts.sdkWorkspaceId, agentData.workspaceId))
          .orderBy(desc(acts.createdAt))
          .limit(5)
      : [];

    // Determine status based on recent activity
    const hasRecentActivity = recentExecutions.length > 0;
    const lastExecution = recentExecutions[0]?.createdAt;
    const isRecentlyActive =
      lastExecution &&
      Date.now() - lastExecution.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days

    const status =
      hasRecentActivity && isRecentlyActive ? "Active" : "Inactive";

    return {
      id: agentData.id,
      name: agentData.name || "Untitled Agent",
      description: `${agentData.name || "このエージェント"}の詳細情報です。ワークスペースID: ${agentData.workspaceId || "未設定"}`,
      owner: agentData.teamName || "Unknown Team",
      updatedAt: agentData.updatedAt.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: status,
      runTime: lastExecution
        ? `${Math.round((Date.now() - lastExecution.getTime()) / (1000 * 60 * 60 * 24))}日前`
        : "未実行",
      requests: `${executionStats?.totalExecutions || 0} 回実行`,
      totalOutput: "---", // Requires additional metrics tracking
      tokens: "---", // Requires additional metrics tracking
      isFavorite: false,
      favoriteCount: 42, // Mock favorite count
      creator: {
        name: agentData.creatorName || "Unknown Creator",
        avatarUrl: agentData.creatorAvatarUrl || undefined,
      },
      previewCard: {
        title: agentData.name || "Untitled Agent",
        creator: agentData.teamName || "Unknown Team",
        stats: {
          likes: "---",
          views: `${executionStats?.totalExecutions || 0}`,
        },
      },
    };
  } catch (error) {
    console.error("Error fetching app details:", error);
    return null;
  }
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const resolvedParams = await params;
  const appDetails = await getAppDetails(resolvedParams.appId);

  if (!appDetails) {
    notFound();
  }

  return <AppDetailClient appDetails={appDetails} />;
}
