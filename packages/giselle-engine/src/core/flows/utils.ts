import type { FlowTrigger, FlowTriggerId } from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";

export function flowTriggerPath(params: { flowTriggerId: FlowTriggerId }) {
	return `flow-triggers/${params.flowTriggerId}`;
}

export async function setFlowTrigger({
	storage,
	flowTrigger,
}: {
	storage: Storage;
	flowTrigger: FlowTrigger;
}) {
	await storage.set(
		flowTriggerPath({ flowTriggerId: flowTrigger.id }),
		flowTrigger,
	);
}
