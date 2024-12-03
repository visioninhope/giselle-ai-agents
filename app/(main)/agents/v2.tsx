import { agents, db, supabaseUserMappings, teamMemberships } from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { eq } from "drizzle-orm";

async function getAgents(userId: string) {
	return await db
		.select({ agents })
		.from(agents)
		.innerJoin(teamMemberships, eq(agents.teamDbId, teamMemberships.teamDbId))
		.innerJoin(
			supabaseUserMappings,
			eq(teamMemberships.userDbId, supabaseUserMappings.userDbId),
		)
		.where(eq(supabaseUserMappings.supabaseUserId, userId));
}
export async function AgentListV2() {
	const user = await getUser();
	const agents = await getAgents(user.id);

	return <div>{agents.length}</div>;
}
