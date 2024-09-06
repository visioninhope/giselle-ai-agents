"use server";

import { agents, db } from "@/drizzle";
import { revalidateTag, unstable_cache } from "next/cache";

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
