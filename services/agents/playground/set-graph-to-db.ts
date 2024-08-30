"use server";

import { agents, builds, db } from "@/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import type { AgentId } from "../types";
import type { PlaygroundGraph } from "./types";

export const setGraphToDb = async (
	agentId: AgentId,
	graph: PlaygroundGraph,
) => {
	await db
		.update(agents)
		.set({ graph, graphHash: createId() })
		.where(eq(agents.id, agentId));
};
