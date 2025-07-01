import {
	useGiselleEngine,
	useWorkflowDesigner,
} from "@giselle-sdk/giselle-engine/react";
import useSWR from "swr";

export function useWorkspaceSecrets() {
	const { data } = useWorkflowDesigner();
	const client = useGiselleEngine();
	return useSWR(
		{
			namespace: "get-workspace-secrets",
			workspaceId: data.id,
		},
		({ workspaceId }) =>
			client.getWorkspaceSecrets({ workspaceId }).then((res) => res.secrets),
	);
}
