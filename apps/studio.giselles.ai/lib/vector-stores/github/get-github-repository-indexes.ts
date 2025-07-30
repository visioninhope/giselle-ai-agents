import { and, eq } from "drizzle-orm";
import {
	db,
	githubRepositoryContentStatus,
	githubRepositoryIndex,
} from "@/drizzle";

type GitHubRepositoryIndex = {
	id: string;
	name: string;
	owner: string;
	repo: string;
	availableContentTypes: ("blob" | "pull_request")[];
};

export async function getGitHubRepositoryIndexes(
	teamDbId: number,
): Promise<GitHubRepositoryIndex[]> {
	const repositories = await db
		.select({
			id: githubRepositoryIndex.id,
			owner: githubRepositoryIndex.owner,
			repo: githubRepositoryIndex.repo,
			contentType: githubRepositoryContentStatus.contentType,
		})
		.from(githubRepositoryIndex)
		.innerJoin(
			githubRepositoryContentStatus,
			eq(
				githubRepositoryContentStatus.repositoryIndexDbId,
				githubRepositoryIndex.dbId,
			),
		)
		.where(
			and(
				eq(githubRepositoryIndex.teamDbId, teamDbId),
				eq(githubRepositoryContentStatus.status, "completed"),
				eq(githubRepositoryContentStatus.enabled, true),
			),
		);

	// Group by repository and collect available content types
	const repoMap = new Map<string, GitHubRepositoryIndex>();

	for (const repo of repositories) {
		const key = `${repo.owner}/${repo.repo}`;
		const existing = repoMap.get(key);

		if (existing) {
			if (!existing.availableContentTypes.includes(repo.contentType)) {
				existing.availableContentTypes.push(repo.contentType);
			}
		} else {
			repoMap.set(key, {
				id: repo.id,
				name: key,
				owner: repo.owner,
				repo: repo.repo,
				availableContentTypes: [repo.contentType],
			});
		}
	}

	return Array.from(repoMap.values());
}
