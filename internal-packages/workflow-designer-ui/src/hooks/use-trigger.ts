import type { FlowTrigger, FlowTriggerId } from "@giselle-sdk/data-type";
import { useGiselleEngine } from "giselle-sdk/react";
import { useCallback } from "react";
import useSWR from "swr";

export function useTrigger(flowTriggerId: FlowTriggerId) {
	const client = useGiselleEngine();
	const { isLoading, data, mutate } = useSWR(`/triggers/${flowTriggerId}`, () =>
		client.getTrigger({ flowTriggerId }).then((res) => res.trigger),
	);

	const setFlowTrigger = useCallback(
		async (newValue: Partial<FlowTrigger>) => {
			if (data === undefined) {
				return;
			}
			mutate(
				async () => {
					const newData = {
						...data,
						...newValue,
					} satisfies FlowTrigger;
					await client.setTrigger({ trigger: newData });
					return newData;
				},
				{
					optimisticData: () => ({
						...data,
						...newValue,
					}),
				},
			);
		},
		[client, mutate, data],
	);
	const enableFlowTrigger = useCallback(async () => {
		await setFlowTrigger({ enable: true });
	}, [setFlowTrigger]);
	const disableFlowTrigger = useCallback(async () => {
		await setFlowTrigger({ enable: false });
	}, [setFlowTrigger]);
	return {
		isLoading,
		data,
		enableFlowTrigger,
		disableFlowTrigger,
	};
}
