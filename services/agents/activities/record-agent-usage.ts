import { toUTCDate } from "@/lib/date";
import { reportAgentTimeUsage } from "@/services/usage-based-billing/report-agent-time-usage";
import type { AgentId } from "../types";
import { saveAgentActivity } from "./save-agent-activity";

export async function recordAgentUsage(
	agentId: AgentId,
	startedAt: number,
	endedAt: number,
	totalDurationMs: number,
) {
	const startedAtDateUTC = toUTCDate(new Date(startedAt));
	const endedAtDateUTC = toUTCDate(new Date(endedAt));
	await saveAgentActivity(
		agentId,
		startedAtDateUTC,
		endedAtDateUTC,
		totalDurationMs,
	);
	await reportAgentTimeUsage(endedAtDateUTC);
}
