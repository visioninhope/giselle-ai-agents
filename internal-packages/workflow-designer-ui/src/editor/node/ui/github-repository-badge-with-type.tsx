import { CodeIcon, GitPullRequestIcon } from "lucide-react";
import { GitHubIcon } from "../../../icons";

interface GitHubRepositoryBadgeWithTypeProps {
	owner: string;
	repo: string;
	contentType?: "blob" | "pull_request";
}

/**
 * A component that displays a GitHub repository badge with content type
 */
export function GitHubRepositoryBadgeWithType({
	owner,
	repo,
	contentType,
}: GitHubRepositoryBadgeWithTypeProps) {
	return (
		<div className="flex flex-col gap-[4px] rounded-2xl bg-black-900 px-[12px] py-[8px] text-white-200 transition-colors">
			<div className="flex items-center gap-[6px] text-[12px]">
				<GitHubIcon className="size-[18px]" />
				<div className="space-x-[2px]">
					<span>{owner}</span>
					<span>/</span>
					<span>{repo}</span>
				</div>
			</div>
			{contentType && (
				<div className="flex items-center gap-1 text-[10px] text-slate-400">
					{contentType === "pull_request" ? (
						<>
							<GitPullRequestIcon className="w-3 h-3" />
							<span>Pull Requests</span>
						</>
					) : (
						<>
							<CodeIcon className="w-3 h-3" />
							<span>Code</span>
						</>
					)}
				</div>
			)}
		</div>
	);
}
