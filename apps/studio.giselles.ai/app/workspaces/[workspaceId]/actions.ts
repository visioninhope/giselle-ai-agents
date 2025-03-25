'use server';

import { db, agents } from "@/drizzle";
import { eq } from "drizzle-orm/sql";
import { WorkspaceId } from "@giselle-sdk/data-type";

export async function updateAgentName(workspaceId: WorkspaceId, name: string) {
  await db
    .update(agents)
    .set({ name })
    .where(eq(agents.workspaceId, workspaceId));
}
