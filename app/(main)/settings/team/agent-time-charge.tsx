import { calculateAgentTimeUsage } from "@/services/agents/activities";
import { fetchCurrentTeam, isProPlan } from "@/services/teams";
import {
	AgentTimeUsageForFreePlan,
	AgentTimeUsageForProPlan,
} from "./components/agent-time-usage";

export async function AgentTimeCharge() {
	const currentTeam = await fetchCurrentTeam();
	const currentTeamIsPro = isProPlan(currentTeam);
	const usedMinutes = await calculateAgentTimeUsage(currentTeam.dbId);

	return (
		<div className="bg-transparent rounded-[16px] border border-black-70 py-[16px] px-[24px] w-full gap-[16px] grid">
			{currentTeamIsPro ? (
				<AgentTimeUsageForProPlan usedMinutes={usedMinutes} />
			) : (
				<AgentTimeUsageForFreePlan usedMinutes={usedMinutes} />
			)}
		</div>
	);
}
