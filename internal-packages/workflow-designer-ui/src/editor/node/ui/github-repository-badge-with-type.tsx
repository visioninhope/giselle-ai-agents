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
