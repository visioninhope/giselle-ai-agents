import { settingsV2Flag } from "@/flags";
import { cn } from "@/lib/utils";
import { calculateAgentTimeUsageMs } from "@/services/agents/activities";
import { fetchCurrentTeam, isProPlan } from "@/services/teams";
import {
	AgentTimeUsageForFreePlan,
	AgentTimeUsageForProPlan,
} from "./components/agent-time-usage";

export async function AgentTimeCharge() {
	const currentTeam = await fetchCurrentTeam();
	const currentTeamIsPro = isProPlan(currentTeam);
	const timeChargeMs = await calculateAgentTimeUsageMs(currentTeam.dbId);
	// Round to 2 decimal places for display
	const usedMinutes = Math.ceil((timeChargeMs / 1000 / 60) * 100) / 100;
	const settingsV2Mode = await settingsV2Flag();

	return (
		<div
			className={cn(
				"bg-transparent rounded-[16px] border border-black-70 py-[16px] px-[24px] w-full gap-[16px] grid",
				settingsV2Mode &&
					"rounded-[8px] border-[0.5px] border-black-400 px-[24px] pt-[16px] pb-[24px] gap-[24px]",
			)}
		>
			{currentTeamIsPro ? (
				<AgentTimeUsageForProPlan
					usedMinutes={usedMinutes}
					{...(settingsV2Mode && { settingsV2Mode })}
				/>
			) : (
				<AgentTimeUsageForFreePlan
					usedMinutes={usedMinutes}
					{...(settingsV2Mode && { settingsV2Mode })}
				/>
			)}
		</div>
	);
}
