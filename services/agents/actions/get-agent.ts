"use server";

import { agents, db, supabaseUserMappings, teamMemberships } from "@/drizzle";
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
		async () => {
			const result = await db
				.select({ agents })
				.from(agents)
				.innerJoin(
					teamMemberships,
					eq(agents.teamDbId, teamMemberships.teamDbId),
				)
				.innerJoin(
					supabaseUserMappings,
					eq(teamMemberships.userDbId, supabaseUserMappings.userDbId),
				)
				.where(eq(supabaseUserMappings.supabaseUserId, args.userId));

			return result.map((row) => row.agents);
		},
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
