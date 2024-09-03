"use server";

import { agents, db, knowledges } from "@/drizzle";
import type { AgentId } from "@/services/agents";
import { eq } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";
import type { Knowledge } from "../types";
import { getKnowledgeContents } from "./get-knowledge-contents";

const getKnowledgesTag = (agentId: AgentId) => `${agentId}.getKnowledges`;
export const getKnowledges = async (agentId: AgentId) => {
	const dbKnowledges = await getCachedKnowledges(agentId);
	const knowledgeWithContents = await Promise.all(
		dbKnowledges.map(async (knowledge) => ({
			...knowledge,
			contents: await getKnowledgeContents(knowledge.id),
		})),
	);
	return knowledgeWithContents.map(
		(knowledge) =>
			({
				id: knowledge.id,
				name: knowledge.name,
				contents: knowledge.contents.map((knowledgeContent) => ({
					id: knowledgeContent.id,
					name: knowledgeContent.name,
					// status: knowledgeContent.status,
					status: "in_progress",
				})),
			}) satisfies Knowledge,
	);
};

export const revalidateGetKnowledges = async (agentId: AgentId) => {
	revalidateTag(getKnowledgesTag(agentId));
};

const getCachedKnowledges = async (agentId: AgentId) => {
	const cachedKnowledges = unstable_cache(
		() =>
			db
				.select({
					id: knowledges.id,
					name: knowledges.name,
				})
				.from(knowledges)
				.innerJoin(agents, eq(agents.dbId, knowledges.agentDbId))
				.where(eq(agents.id, agentId)),
		[agentId],
		{
			tags: [getKnowledgesTag(agentId)],
		},
	);

	return cachedKnowledges();
};
