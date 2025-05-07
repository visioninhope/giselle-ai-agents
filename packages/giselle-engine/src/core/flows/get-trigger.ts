import { FlowTrigger, type FlowTriggerId } from "@giselle-sdk/data-type";
import type { GiselleEngineContext } from "../types";
import { getFlowTrigger } from "./utils";

export async function getTrigger(args: {
	context: GiselleEngineContext;
	flowTriggerId: FlowTriggerId;
}) {
	const unsafe = await getFlowTrigger({
		storage: args.context.storage,
		flowTriggerId: args.flowTriggerId,
	});
	return FlowTrigger.parse(unsafe);
}
