import { GitHubIcon } from "../../../icons";

export interface GitHubRepositoryBadgeUIProps {
	owner: string;
	repo: string;
}

/**
 * A base UI component that displays a GitHub repository badge with the GitHub icon
 */
export function GitHubRepositoryBadgeUI({
	owner,
	repo,
}: GitHubRepositoryBadgeUIProps) {
	return (
		<div className="flex items-center gap-[6px] rounded-full bg-black-900 pl-[10px] pr-[12px] py-2 text-sm text-white-200 transition-colors text-[12px]">
			<GitHubIcon className="size-[18px]" />
			<div className="space-x-[2px]">
				<span>{owner}</span>
				<span>/</span>
				<span>{repo}</span>
			</div>
		</div>
	);
}

export default GitHubRepositoryBadgeUI;
