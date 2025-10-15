import {
	useFeatureFlag,
	useGiselleEngine,
	useWorkflowDesigner,
} from "@giselle-sdk/giselle/react";
import useSWR from "swr";
export function useWorkspaceSecrets(tags?: string[]) {
	const { data } = useWorkflowDesigner();
	const client = useGiselleEngine();
	const { experimental_storage } = useFeatureFlag();
	return useSWR(
		{
			namespace: "get-workspace-secrets",
			workspaceId: data.id,
			tags: tags ?? [],
			useExperimentalStorage: experimental_storage,
		},
		({ workspaceId, tags, useExperimentalStorage }) =>
			client
				.getWorkspaceSecrets({ workspaceId, tags, useExperimentalStorage })
				.then((res) => res.secrets),
	);
}
