import { Card } from "@/app/(main)/settings/components/card";
import { formatTimestamp } from "@/app/(playground)/p/[agentId]/canary/lib/utils";
import { getAgentActivities } from "./actions";

export async function AgentUsage() {
	const result = await getAgentActivities();

	if (!result.success || !result.data) {
		return (
			<Card title="Recent Agent Usage">
				<div className="text-zinc-400 p-4">Failed to load agent activities</div>
			</Card>
		);
	}

	const activities = result.data;

	return (
		<Card title="Recent Agent Usage">
			<div className="font-avenir rounded-[16px]">
				<div className="grid grid-cols-4 gap-4 border-b border-zinc-800 bg-zinc-900/50 p-4 font-medium text-zinc-200">
					<div>Agent</div>
					<div>Start Time</div>
					<div>End Time</div>
					<div>Charge</div>
				</div>
				<div className="divide-y divide-zinc-800">
					{activities.length > 0 ? (
						activities.map((activity) => (
							<div
								key={`${activity.agentId}-${activity.startTime}`}
								className="grid grid-cols-4 gap-4 p-4 items-center text-zinc-200"
							>
								<div>{activity.agentName ?? activity.agentId}</div>
								<div className="text-zinc-400">
									{formatTimestamp.toShortDateTime(
										new Date(activity.startTime).getTime(),
									)}
								</div>
								<div className="text-zinc-400">
									{activity.endTime
										? formatTimestamp.toShortDateTime(
												new Date(activity.endTime).getTime(),
											)
										: "-"}
								</div>
								<div>{activity.usedCharge} seconds</div>
							</div>
						))
					) : (
						<div className="p-4 text-zinc-400">No recent agent activities</div>
					)}
				</div>
			</div>
		</Card>
	);
}
