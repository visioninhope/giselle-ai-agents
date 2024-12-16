import { formatTimestamp } from "@/app/(playground)/p/[agentId]/canary/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

type AgentActivity = {
	agentId: string;
	agentName: string | null;
	startTime: Date;
	endTime: Date | null;
	usedCharge: number;
};

type AgentUsageDialogProps = {
	activities: AgentActivity[];
};

export function AgentUsageDialog({ activities }: AgentUsageDialogProps) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="link">View all logs</Button>
			</DialogTrigger>
			<DialogContent className="max-w-6xl">
				<DialogHeader>
					<DialogTitle>Agent Usage Logs</DialogTitle>
				</DialogHeader>
				<div className="font-avenir rounded-[16px]">
					<div className="grid grid-cols-4 gap-4 border-b border-zinc-800 bg-zinc-900/50 p-4 font-medium text-zinc-200">
						<div>Agent</div>
						<div>Start Time</div>
						<div>End Time</div>
						<div>Charge</div>
					</div>
					<div className="max-h-[60vh] overflow-y-auto">
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
								<div className="p-4 text-zinc-400">No agent activities</div>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
