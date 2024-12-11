import { calculateAgentTimeUsageMs } from "@/services/agents/activities";
import { fetchCurrentTeam, isProPlan } from "@/services/teams";
import Decimal from "decimal.js";
import {
	AgentTimeUsageForFreePlan,
	AgentTimeUsageForProPlan,
} from "./components/agent-time-usage";

export async function AgentTimeCharge() {
	const currentTeam = await fetchCurrentTeam();
	const currentTeamIsPro = isProPlan(currentTeam);
	const timeChargeMs = await calculateAgentTimeUsageMs(currentTeam.dbId);
	const timeChargeMsDecimal = new Decimal(timeChargeMs);
	// Round to 2 decimal places for display
	const usedMinutes = timeChargeMsDecimal
		.div(1000 * 60)
		.toDecimalPlaces(2)
		.toNumber();

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
