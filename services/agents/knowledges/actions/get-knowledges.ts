"use server";

import { agents, db, knowledges } from "@/drizzle";
import type { AgentId } from "@/services/agents";
import { eq } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";

const getKnowledgesTag = (agentId: AgentId) => `${agentId}.getKnowledges`;
export const getKnowledges = async (agentId: AgentId) => {
	const cached = unstable_cache(
		() => {
			return db
				.select({
					id: knowledges.id,
					name: knowledges.name,
				})
				.from(knowledges)
				.innerJoin(agents, eq(agents.dbId, knowledges.agentDbId))
				.where(eq(agents.id, agentId));
		},
		[agentId],
		{
			tags: [getKnowledgesTag(agentId)],
		},
	);
	return await cached();
};

export const revalidateGetKnowledges = async (agentId: AgentId) => {
	revalidateTag(getKnowledgesTag(agentId));
};
