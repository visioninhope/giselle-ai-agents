import "@xyflow/react/dist/style.css";
import { getUser } from "@/lib/supabase";
import type { AgentId } from "@/services/agents";
import { Playground } from "@/services/agents/playground";

export default async function AgentPlaygroundPage({
	params,
}: {
	params: { agentId: AgentId };
}) {
	const user = await getUser();
	return (
		<Playground
			agentId={params.agentId}
			requestRunnerProvider="vercelFunctions"
		/>
	);
}
