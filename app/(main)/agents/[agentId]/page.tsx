import "@xyflow/react/dist/style.css";

import { getTeamMembershipByAgentId } from "@/app/(auth)/lib/get-team-membership-by-agent-id";
import type { AgentId } from "@/services/agents";
import { Playground, resolveOptions } from "@/services/agents/playground";

export default async function AgentPlaygroundPage({
	params,
}: {
	params: { agentId: AgentId };
}) {
	const options = await resolveOptions();
	const { agentId } = params;

	const teamMembership = await getTeamMembershipByAgentId(agentId);

	if (!teamMembership) {
		return (
			<div className="pt-10 flex justify-center items-center font-rosart text-3xl">
				404 Not found
			</div>
		);
	}

	return (
		<Playground
			agentId={params.agentId}
			requestRunnerProvider="vercelFunctions"
			options={options}
		/>
	);
}
