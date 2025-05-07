import type { FlowTriggerId } from "@giselle-sdk/data-type";
import { useGiselleEngine } from "giselle-sdk/react";
import useSWR from "swr";

export function ConfiguredView({
	flowTriggerId,
}: {
	flowTriggerId: FlowTriggerId;
}) {
	const client = useGiselleEngine();
	const { isLoading, data } = useSWR(
		[`/triggers/${flowTriggerId}`, flowTriggerId],
		([_, flowTriggerId]) => client.getTrigger({ flowTriggerId }),
	);
	if (isLoading) {
		return "loading...";
	}
	if (data === undefined) {
		return "no data";
	}

	return data.flowTrigger.id;
}
