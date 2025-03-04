import { LocalDateTime } from "./components/local-date-time";

export type AgentActivity = {
	agentId: string;
	agentName: string | null;
	startTime: Date;
	endTime: Date | null;
	usedCharge: number;
};

type AgentUsageTableProps = {
	activities: AgentActivity[];
	containerClassName?: string;
	settingsV2Mode?: boolean;
};

export function AgentUsageTable({
	activities,
	containerClassName,
	settingsV2Mode,
}: AgentUsageTableProps) {
	if (settingsV2Mode) {
		return (
			<div className="flex flex-col gap-y-2">
				<div className="grid grid-cols-4 items-center gap-2 rounded-[4px] bg-white-850/20 p-2 font-bold text-white-400 text-[12px] leading-[15.6px] tracking-normal font-geist">
					<div>Agent</div>
					<div>Start Time</div>
					<div>End Time</div>
					<div>Charge</div>
				</div>
				<div className={containerClassName}>
					<div className="px-2">
						{activities.length > 0 ? (
							activities.map((activity) => (
								<div
									key={`${activity.agentId}-${activity.startTime}`}
									className="grid grid-cols-4 items-center gap-1 py-2 border-b-[0.5px] border-black-400 text-white-400 font-hubotSans font-medium text-[12px] leading-[14.4px] tracking-normal"
								>
									<div className="break-words max-w-xs text-blue-80">
										{activity.agentName ?? activity.agentId}
									</div>
									<div>
										<LocalDateTime date={new Date(activity.startTime)} />
									</div>
									<div>
										{activity.endTime ? (
											<LocalDateTime date={new Date(activity.endTime)} />
										) : (
											"-"
										)}
									</div>
									<div>{activity.usedCharge} seconds</div>
								</div>
							))
						) : (
							<div className="text-black-400 text-[12px] leading-[20.4px] tracking-normal font-geist">
								No agent activities
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="font-avenir rounded-[16px]">
			<div className="grid grid-cols-4 gap-4 border-b border-zinc-800 bg-zinc-900/50 p-4 font-medium text-zinc-200">
				<div>Agent</div>
				<div>Start Time</div>
				<div>End Time</div>
				<div>Charge</div>
			</div>
			<div className={containerClassName}>
				<div className="divide-y divide-zinc-800">
					{activities.length > 0 ? (
						activities.map((activity) => (
							<div
								key={`${activity.agentId}-${activity.startTime}`}
								className="grid grid-cols-4 gap-4 p-4 items-center text-zinc-200"
							>
								<div className="break-words max-w-xs">
									{activity.agentName ?? activity.agentId}
								</div>
								<div className="text-zinc-400">
									<LocalDateTime date={new Date(activity.startTime)} />
								</div>
								<div className="text-zinc-400">
									{activity.endTime ? (
										<LocalDateTime date={new Date(activity.endTime)} />
									) : (
										"-"
									)}
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
	);
}
