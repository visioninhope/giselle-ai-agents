"use server";

import { agents, db } from "@/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { revalidateGetAgents } from "./get-agent";

type CreateAgentArgs = {
	userId: string;
};
export const createAgent = async (args: CreateAgentArgs) => {
	const id = `agnt_${createId()}` as const;
	await db.insert(agents).values({
		id,
	});
	revalidateGetAgents({
		userId: args.userId,
	});
	return { id };
};
