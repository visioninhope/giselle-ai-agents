"use server";

import { getCurrentTeam } from "@/app/(auth)/lib";
import { agents, db } from "@/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { revalidateGetAgents } from "./get-agent";

type CreateAgentArgs = {
	userId: string;
};
export const createAgent = async (args: CreateAgentArgs) => {
	const id = `agnt_${createId()}` as const;
	const team = await getCurrentTeam();
	await db.insert(agents).values({
		id,
		teamDbId: team.dbId,
	});
	revalidateGetAgents({
		userId: args.userId,
	});
	return { id };
};
