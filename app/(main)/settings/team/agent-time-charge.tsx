import { fetchCurrentTeam } from "@/services/teams";
import {
	AgentTimeUsageForFreePlan,
	AgentTimeUsageForProPlan,
} from "./components/agent-time-usage";

export async function AgentTimeCharge() {
	const currentTeam = await fetchCurrentTeam();
	const isProPlan =
		currentTeam.activeSubscriptionId != null || currentTeam.type === "internal";
	const usedMinutes = 60;

	return (
		<div className="bg-transparent rounded-[16px] border border-black-70 py-[16px] px-[24px] w-full gap-[16px] grid">
			{isProPlan ? (
				<AgentTimeUsageForProPlan usedMinutes={usedMinutes} />
			) : (
				<AgentTimeUsageForFreePlan usedMinutes={usedMinutes} />
			)}
		</div>
	);
}
