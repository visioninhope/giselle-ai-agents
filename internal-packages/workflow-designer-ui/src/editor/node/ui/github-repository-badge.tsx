import type { FlowTriggerId } from "@giselle-sdk/data-type";
import type React from "react";
import { useGitHubTrigger } from "../../lib/use-github-trigger";
import { GitHubRepositoryBadgeUI } from "./github-repository-badge-ui";

export interface GitHubRepositoryLinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	flowTriggerId: FlowTriggerId;
}

/**
 * A component that fetches and displays a GitHub repository badge for a flow trigger
 */
export function GitHubRepositoryBadge({
	flowTriggerId,
}: GitHubRepositoryLinkProps) {
	const { isLoading, data } = useGitHubTrigger(flowTriggerId);

	if (isLoading) {
		return null;
	}
	if (data === undefined) {
		return null;
	}

	return (
		<GitHubRepositoryBadgeUI
			owner={data.githubRepositoryFullname.owner}
			repo={data.githubRepositoryFullname.repo}
		/>
	);
}

export default GitHubRepositoryBadge;
