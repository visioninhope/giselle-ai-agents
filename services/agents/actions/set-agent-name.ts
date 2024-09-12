"use server";

import { agents, db } from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { eq } from "drizzle-orm";
import type { AgentId } from "../types";
import { revalidateGetAgents } from "./get-agent";

type SetAgentNameArgs = {
	agentId: AgentId;
	name: string;
};
export const setAgentName = async (args: SetAgentNameArgs) => {
	const user = await getUser();
	await db
		.update(agents)
		.set({
			name: args.name,
		})
		.where(eq(agents.id, args.agentId));
	await revalidateGetAgents({ userId: user.id });
};
