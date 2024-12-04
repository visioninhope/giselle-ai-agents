import { playgroundV2Flag } from "@/flags";
import { createAgent, getAgents } from "@/services/agents";
import { CreateAgentButton } from "@/services/agents/components";
import { fetchCurrentTeam } from "@/services/teams/fetch-current-team";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AgentListV2 } from "./v2";

type AgentListProps = {
	teamDbId: number;
};
async function AgentList(props: AgentListProps) {
	const agents = await getAgents({ teamDbId: props.teamDbId });

	return (
		<div className="flex flex-col gap-2">
			{agents.map(({ id, name }) => (
				<a key={id} className="flex border border-border p-4" href={`/p/${id}`}>
					{name ?? id}
				</a>
			))}
		</div>
	);
}
export default async function AgentListPage() {
	const enableV2 = await playgroundV2Flag();
	if (enableV2) {
		return <AgentListV2 />;
	}
	const currentTeam = await fetchCurrentTeam();
	async function createAgentAction() {
		"use server";
		const agent = await createAgent({ teamDbId: currentTeam.dbId });
		redirect(`/p/${agent.id}`);
	}
	return (
		<div className="container mt-8">
			<section className="text-foreground">
				<div className="flex flex-col gap-8">
					<div className="flex justify-between">
						<h1>Agents</h1>
						<CreateAgentButton createAgentAction={createAgentAction} />
					</div>
					<Suspense fallback={<span>loading</span>}>
						<AgentList teamDbId={currentTeam.dbId} />
					</Suspense>
				</div>
			</section>
		</div>
	);
}
