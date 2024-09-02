import { agents, db, knowledges } from "@/drizzle";
import type { AgentId } from "@/services/agents";
import { eq } from "drizzle-orm";

export const getKnowledges = async (agentId: AgentId) =>
	await db
		.select({
			id: knowledges.id,
			name: knowledges.name,
		})
		.from(knowledges)
		.innerJoin(agents, eq(agents.dbId, knowledges.agentDbId))
		.where(eq(agents.id, agentId));
