"use server";

import { agents, db } from "@/drizzle";
import { eq } from "drizzle-orm";
import type { AgentId } from "../../types";

interface UpdateAgentNameInput {
	agentId: AgentId;
	name: string;
}
export async function updateAgentName(input: UpdateAgentNameInput) {
	await db
		.update(agents)
		.set({ name: input.name })
		.where(eq(agents.id, input.agentId));
}
