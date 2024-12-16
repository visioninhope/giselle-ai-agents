import { Card } from "@/app/(main)/settings/components/card";

const agentLogs = [
	{
		agentId: "agent_1",
		agentName: "Data Analysis Agent",
		startTime: "2024-03-18 10:00:00",
		endTime: "2024-03-18 10:05:00",
		errorMessage: "",
		usedCharge: 5,
	},
	{
		agentId: "agent_2",
		agentName: "Code Review Agent",
		startTime: "2024-03-18 11:00:00",
		endTime: null,
		errorMessage: "",
		usedCharge: 3,
	},
];

export function AgentUsage() {
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
					{agentLogs.slice(0, 5).map((log) => (
						<div
							key={`${log.startTime}-${log.endTime}`}
							className="grid grid-cols-4 gap-4 p-4 items-center text-zinc-200"
						>
							<div>{log.agentName}</div>
							<div className="text-zinc-400">{log.startTime}</div>
							<div className="text-zinc-400">{log.endTime || "-"}</div>
							<div>{log.usedCharge} minutes</div>
						</div>
					))}
				</div>
			</div>
		</Card>
	);
}
