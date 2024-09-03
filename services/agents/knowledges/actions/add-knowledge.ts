"use server";

import { agents, db, knowledges } from "@/drizzle";
import { eq } from "drizzle-orm";
import type { AgentId } from "../../types";
import type { Knowledge } from "../types";
import { revalidateGetKnowledges } from "./get-knowledges";

export const addKnowledge = async (agentId: AgentId, knowledge: Knowledge) => {
	const [agent] = await db
		.select({ dbId: agents.dbId })
		.from(agents)
		.where(eq(agents.id, agentId));
	await db.insert(knowledges).values({
		id: knowledge.id,
		name: knowledge.name,
		agentDbId: agent.dbId,
	});
	await revalidateGetKnowledges(agentId);
};
