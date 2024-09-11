import "@xyflow/react/dist/style.css";
import type { AgentId } from "@/services/agents";
import { Playground, resolveOptions } from "@/services/agents/playground";

export default async function AgentPlaygroundPage({
	params,
}: {
	params: { agentId: AgentId };
}) {
	const options = await resolveOptions();
	return (
		<Playground
			agentId={params.agentId}
			requestRunnerProvider="vercelFunctions"
			options={options}
		/>
	);
}
