import "@xyflow/react/dist/style.css";

import { getTeamMembershipByAgentId } from "@/app/(auth)/lib/get-team-membership-by-agent-id";
import type { AgentId } from "@/services/agents";
import { notFound } from "next/navigation";
import { Playground } from "./beta-proto/component";

export default async function AgentPlaygroundPage({
	params,
}: {
	params: { agentId: AgentId };
}) {
	const { agentId } = params;

	const teamMembership = await getTeamMembershipByAgentId(agentId);

	if (!teamMembership) {
		notFound();
	}

	return <Playground />;
}
