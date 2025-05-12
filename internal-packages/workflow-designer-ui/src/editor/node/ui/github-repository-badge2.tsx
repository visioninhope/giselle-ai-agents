import { useGiselleEngine } from "giselle-sdk/react";
import useSWR from "swr";
import { GitHubRepositoryBadgeUI } from "./github-repository-badge-ui";

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
		<GitHubRepositoryBadgeUI
			owner={data.fullname.owner}
			repo={data.fullname.repo}
		/>
	);
}
