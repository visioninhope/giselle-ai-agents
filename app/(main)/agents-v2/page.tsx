import { getCurrentTeam } from "@/app/(auth)/lib";
import { putGraph } from "@/app/(playground)/p/[agentId]/canary/actions";
import { Button } from "@/components/ui/button";
import { agents, db, supabaseUserMappings, teamMemberships } from "@/drizzle";
import { getUser } from "@/lib/supabase";
import { createId } from "@paralleldrive/cuid2";
import { and, eq, isNotNull } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { initGraph } from "../../(playground)/p/[agentId]/canary/utils";

async function AgentList() {
	const user = await getUser();
	const dbAgents = await db
		.select({ id: agents.id, name: agents.name })
		.from(agents)
		.innerJoin(teamMemberships, eq(agents.teamDbId, teamMemberships.teamDbId))
		.innerJoin(
			supabaseUserMappings,
			eq(teamMemberships.userDbId, supabaseUserMappings.userDbId),
		)
		.where(
			and(
				eq(supabaseUserMappings.supabaseUserId, user.id),
				isNotNull(agents.graphUrl),
			),
		);
	if (dbAgents.length === 0) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="grid gap-[12px] justify-center text-center">
					<div>No agents found</div>
				</div>
			</div>
		);
	}
	return (
		<div className="px-[16px]">
			{dbAgents.map((agent) => (
				<div key={agent.id}>
					<Link href={`/p/${agent.id}/canary`}>
						{agent.name ?? "Unname Agent"}
					</Link>
				</div>
			))}
		</div>
	);
}
export default function AgentListV2Page() {
	return <AgentList />;
}
