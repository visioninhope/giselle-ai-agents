import "@xyflow/react/dist/style.css";
import type { AgentId } from "@/services/agents";
import { Playground } from "@/services/agents/playground";
import { startRequest } from "@/services/agents/requests";

export default function AgentPlaygroundPage({
	params,
}: {
	params: { agentId: AgentId };
}) {
	return (
		<Playground agentId={params.agentId} onRequestStartAction={startRequest} />
	);
}
