import type { GitHubActionCommandCofiguredState } from "@giselle-sdk/data-type";
import { githubActionIdToLabel } from "@giselle-sdk/flow";
import { useGiselleEngine } from "giselle-sdk/react";
import useSWR from "swr";
import { GitHubRepositoryBlock } from "../../ui";

export function GitHubActionConfiguredView({
	state,
}: {
	state: GitHubActionCommandCofiguredState;
}) {
	const client = useGiselleEngine();
	const { isLoading, data } = useSWR(
		{
			installationId: state.installationId,
			repositoryNodeId: state.repositoryNodeId,
		},
		({ installationId, repositoryNodeId }) =>
			client.getGitHubRepositoryFullname({
				installationId,
				repositoryNodeId,
			}),
	);

	return (
		<div className="flex flex-col gap-[17px] p-0">
			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-white-400">Repository</p>
				<div className="px-[12px] pt-[6px]">
					{isLoading || data === undefined ? (
						<p>loading...</p>
					) : (
						<GitHubRepositoryBlock
							owner={data.fullname.owner}
							repo={data.fullname.repo}
						/>
					)}
				</div>
			</div>

			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-white-400">Event Type</p>
				<div className="px-[16px] py-[9px] w-full bg-transparent text-[14px]">
					{githubActionIdToLabel(state.commandId)}
				</div>
			</div>
		</div>
	);
}
