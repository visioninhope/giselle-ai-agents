import type { FlowTriggerId } from "@giselle-sdk/data-type";
import { useTrigger } from "../../../lib/use-trigger";

export function ConfiguredView2({
	flowTriggerId,
}: {
	flowTriggerId: FlowTriggerId;
}) {
	const { isLoading, data, enableFlowTrigger, disableFlowTrigger } =
		useTrigger(flowTriggerId);
	if (isLoading) {
		return "loading...";
	}
	if (data === undefined) {
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
		</div>
	);
}
