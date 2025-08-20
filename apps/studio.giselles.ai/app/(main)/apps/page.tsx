import { Toasts } from "@giselles-ai/components/toasts";
import { ToastProvider } from "@giselles-ai/contexts/toast";
import { isNotNull } from "drizzle-orm";
import { Suspense } from "react";
import { db } from "@/drizzle";
import { fetchCurrentTeam } from "@/services/teams";
import { SearchableAgentList } from "./components/searchable-agent-list";

async function AgentList() {
	const currentTeam = await fetchCurrentTeam();
	const dbAgents = await db.query.agents.findMany({
		where: (agents, { and, eq }) =>
			and(eq(agents.teamDbId, currentTeam.dbId), isNotNull(agents.workspaceId)),
		orderBy: (agents, { desc }) => desc(agents.updatedAt),
	});
	if (dbAgents.length === 0) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="grid gap-[8px] justify-center text-center">
					<h3 className="text-[18px] font-geist font-bold text-black-400">
						No apps yet.
					</h3>
					<p className="text-[12px] font-geist text-black-400">
						Please create a new app with the 'New App +' button.
					</p>
				</div>
			</div>
		);
	}
	return <SearchableAgentList agents={dbAgents} />;
}

export default function AgentListV2Page() {
	return (
		<ToastProvider>
			<div className="w-full pt-2 pb-2">
				<Suspense fallback={<p className="text-center py-8">Loading...</p>}>
					<AgentList />
				</Suspense>
				<Toasts />
			</div>
		</ToastProvider>
	);
}
