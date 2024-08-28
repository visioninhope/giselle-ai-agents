"use server";

import { agents, blueprints, db } from "@/drizzle";
import { eq } from "drizzle-orm";
import type { AgentId } from "../types";

export const getGraphFromDb = async (agentId: AgentId) => {
	const [agent] = await db.select().from(agents).where(eq(agents.id, agentId));
	return agent.graph;
};
