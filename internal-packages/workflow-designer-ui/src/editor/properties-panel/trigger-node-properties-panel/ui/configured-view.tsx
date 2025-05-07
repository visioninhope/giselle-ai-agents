import type { FlowTriggerId } from "@giselle-sdk/data-type";
import { useGiselleEngine } from "giselle-sdk/react";
import useSWR from "swr";

export function ConfiguredView({
	flowTriggerId,
}: {
	flowTriggerId: FlowTriggerId;
}) {
	const client = useGiselleEngine();
	const { isLoading: isLoadingFlowTriggerData, data: flowTriggerData } = useSWR(
		[`/triggers/${flowTriggerId}`, flowTriggerId],
		([_, flowTriggerId]) => client.getTrigger({ flowTriggerId }),
	);
	const {
		isLoading: isLoadingGitHubRepositoryFullname,
		data: githubRepositoryFullnameData,
	} = useSWR(
		flowTriggerData &&
			flowTriggerData.flowTrigger.configuration.provider === "github"
			? [
					`/github/repositories/${flowTriggerData.flowTrigger.configuration.repositoryNodeId}`,
					flowTriggerData.flowTrigger,
				]
			: null,
		([_, flowTrigger]) =>
			client.getGitHubRepositoryFullname({
				installationId: flowTrigger.configuration.installationId,
				repositoryNodeId: flowTrigger.configuration.repositoryNodeId,
			}),
	);

	if (isLoadingFlowTriggerData || isLoadingGitHubRepositoryFullname) {
		return "loading...";
	}
	if (
		flowTriggerData === undefined ||
		githubRepositoryFullnameData === undefined
	) {
		return "no data";
	}

	return (
		<p>
			{flowTriggerData.flowTrigger.id},
			{flowTriggerData.flowTrigger.configuration.event.id},
			{githubRepositoryFullnameData.fullname.owner},
			{githubRepositoryFullnameData.fullname.repo}
		</p>
	);
}
