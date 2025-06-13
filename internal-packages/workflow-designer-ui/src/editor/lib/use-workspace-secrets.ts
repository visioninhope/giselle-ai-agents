import type { WorkspaceId } from "@giselle-sdk/data-type";
import { useGiselleEngine } from "giselle-sdk/react";
import useSWR from "swr";

export function useWorkspaceSecrets(workspaceId: WorkspaceId) {
	const client = useGiselleEngine();
	return useSWR(
		{
			namespace: "get-workspace-secrets",
			workspaceId,
		},
		({ workspaceId }) =>
			client.getWorkspaceSecrets({ workspaceId }).then((res) => res.secrets),
	);
}
