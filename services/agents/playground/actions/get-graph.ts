"use server";

import { agents, builds, db } from "@/drizzle";
import { eq } from "drizzle-orm";
import { revalidateTag, unstable_cache } from "next/cache";
import type { AgentId } from "../../types";

const tag = "agent.graph";
type GetGraphArgs = {
	agentId: AgentId;
	userId: string;
};
export const getGraph = async (args: GetGraphArgs) => {
	console.log("getGraph");
	const cached = unstable_cache(
		async () => {
			console.log("getGraph cache");
			const [agent] = await db
				.select()
				.from(agents)
				.where(eq(agents.id, args.agentId));
			return agent.graph;
		},
		[args.userId],
		{
			tags: [tag],
		},
	);
	return await cached();
};

export const revalidateGetGraph = async () => {
	revalidateTag(tag);
};
