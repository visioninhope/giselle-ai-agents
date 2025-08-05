interface GitHubRepositoryBadgeWithTypeProps {
	owner: string;
	repo: string;
}

/**
 * A component that displays a GitHub repository badge
 */
export function GitHubRepositoryBadgeWithType({
	owner,
	repo,
}: GitHubRepositoryBadgeWithTypeProps) {
	return (
		<div className="flex flex-col gap-[4px] rounded-2xl bg-black-900 px-[16px] py-[8px] text-white-200 transition-colors">
			<div className="flex items-center text-[12px]">
				<div className="space-x-[2px]">
					<span>{owner}</span>
					<span>/</span>
					<span>{repo}</span>
				</div>
			</div>
		</div>
	);
}
