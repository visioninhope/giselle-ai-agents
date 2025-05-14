import type { FlowTriggerId } from "@giselle-sdk/data-type";
import { useTrigger } from "../../../lib/use-trigger";

export function ManualTriggerConfiguredView({
	flowTriggerId,
}: {
	flowTriggerId: FlowTriggerId;
}) {
	const { isLoading, data, enableFlowTrigger, disableFlowTrigger } =
		useTrigger(flowTriggerId);
	if (isLoading) {
		return "loading...";
	}
	if (data === undefined || data.configuration.provider !== "manual") {
		return "no data";
	}

	return (
		<div className="flex flex-col gap-[17px] p-0">
			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-white-400">State</p>
				<div className="px-[16px] py-[9px] w-full bg-transparent text-[14px]">
					<div className="flex gap-[6px]">
						{data.enable ? (
							<>
								<span>Enable</span>
								<button
									type="button"
									onClick={disableFlowTrigger}
									className="text-blue-900 cursor-pointer outline-none hover:underline"
								>
									→ Disable Trigger
								</button>
							</>
						) : (
							<>
								<span>Disable</span>
								<button
									type="button"
									onClick={enableFlowTrigger}
									className="text-blue-900 cursor-pointer outline-none hover:underline"
								>
									→ Enable
								</button>
							</>
						)}
					</div>
				</div>
			</div>

			{data.configuration.event.parameters.length > 0 && (
				<div className="space-y-[4px]">
					<p className="text-[14px] py-[1.5px] text-white-400">Parameters</p>
					<div className="px-[16px] py-[9px] w-full bg-transparent">
						<div className="flex flex-col gap-[8px]">
							{data.configuration.event.parameters.map((param) => (
								<div
									key={param.id}
									className="flex items-center justify-between p-[8px] bg-white-900/10 rounded-[4px]"
								>
									<div className="flex items-center gap-[8px]">
										<span className="font-medium text-[14px]">
											{param.name}
										</span>
										<span className="text-[12px] text-black-500">
											{param.type}
											{param.required ? " (required)" : ""}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
