"use server";

import { agents, blueprints, db } from "@/drizzle";
import { eq } from "drizzle-orm";
import type { AgentId } from "../types";
import type { PlaygroundGraph } from "./types";

export const setGraphToDb = async (
	agentId: AgentId,
	graph: PlaygroundGraph,
) => {
	await db.update(agents).set({ graph }).where(eq(agents.id, agentId));
};
