import {
	useGiselleEngine,
	useWorkflowDesigner,
} from "@giselle-sdk/giselle-engine/react";
import useSWR from "swr";

export function useWorkspaceDataSources() {
	const { data } = useWorkflowDesigner();
	const client = useGiselleEngine();
	return useSWR(
		{
			namespace: "get-workspace-data-sources",
			workspaceId: data.id,
		},
		({ workspaceId }) =>
			client
				.getWorkspaceDataSources({ workspaceId })
				.then((res) => res.dataSources),
	);
}
