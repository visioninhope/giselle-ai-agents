import { useGiselleEngine } from "giselle-sdk/react";
import useSWR from "swr";
import { GitHubIcon } from "../../../icons";

export function GitHubRepositoryBadge2({
	installationId,
	repositoryNodeId,
}: {
	installationId: number;
	repositoryNodeId: string;
}) {
	const client = useGiselleEngine();
	const { isLoading, data } = useSWR(
		{
			installationId,
			repositoryNodeId,
		},
		({ installationId, repositoryNodeId }) =>
			client.getGitHubRepositoryFullname({
				installationId,
				repositoryNodeId,
			}),
	);

	if (isLoading) {
		return null;
	}
	if (data === undefined) {
		return null;
	}

	return (
		<div className="flex items-center gap-[6px] rounded-full bg-black-900 pl-[10px] pr-[12px] py-2 text-sm text-white-200 transition-colors text-[12px]">
			<GitHubIcon className="size-[18px]" />
			<div className="space-x-[2px]">
				<span>{data.fullname.owner}</span>
				<span>/</span>
				<span>{data.fullname.repo}</span>
			</div>
		</div>
	);
}
