import { and, desc, eq, isNotNull } from "drizzle-orm";
import { agents, db } from "@/drizzle";
import { fetchUserTeams } from "@/services/teams";
import { ShowcaseClient } from "./showcase-client";

export default async function StageShowcasePage() {
  const teams = await fetchUserTeams();
  const teamOptions = teams.map((team) => ({
    value: team.id,
    label: team.name,
    avatarUrl: team.avatarUrl ?? undefined,
  }));

  // Fetch apps (agents) for all teams
  const teamAppsMap = new Map();
  for (const team of teams) {
    const dbAgents = await db
      .select({
        id: agents.id,
        name: agents.name,
        updatedAt: agents.updatedAt,
        workspaceId: agents.workspaceId,
      })
      .from(agents)
      .where(and(eq(agents.teamDbId, team.dbId), isNotNull(agents.workspaceId)))
      .orderBy(desc(agents.updatedAt));

    teamAppsMap.set(team.id, dbAgents);
  }

  // Convert map to plain object for client component
  const teamApps = Object.fromEntries(teamAppsMap);

  return <ShowcaseClient teamOptions={teamOptions} teamApps={teamApps} />;
}
