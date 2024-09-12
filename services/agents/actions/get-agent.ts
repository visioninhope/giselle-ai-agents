"use server";

import { agents, db } from "@/drizzle";
import { eq } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";
import type { AgentId } from "../types";

type GetAgentsArgs = {
	userId: string;
};

type TagParams = {
	userId: string;
};

const getAgentsTag = (params: TagParams) => `${params.userId}.getAgents`;

export const getAgents = async (args: GetAgentsArgs) => {
	const cachedAgents = unstable_cache(
		() => db.select().from(agents),
		[args.userId],
		{ tags: [getAgentsTag(args)] },
	);
	return await cachedAgents();
};

export const revalidateGetAgents = async (params: TagParams) => {
	revalidateTag(getAgentsTag(params));
};

export const getAgent = async (args: { agentId: AgentId }) => {
	const agent = await db.query.agents.findFirst({
		where: eq(agents.id, args.agentId),
	});
	if (agent == null) {
		throw new Error(`Agent not found: ${args.agentId}`);
	}
	return agent;
};
