import type { FlowTriggerId } from "@giselle-sdk/data-type";
import { useGitHubTrigger } from "../../../lib/use-github-trigger";

export function ConfiguredView({
	flowTriggerId,
}: {
	flowTriggerId: FlowTriggerId;
}) {
	const { isLoading, data } = useGitHubTrigger(flowTriggerId);
	if (isLoading) {
		return "loading...";
	}
	if (data === undefined) {
		return "no data";
	}

	return (
		<p>
			{data.flowTrigger.id},{data.flowTrigger.configuration.event.id},
			{data.githubRepositoryFullname.owner},{data.githubRepositoryFullname.repo}
		</p>
	);
}
