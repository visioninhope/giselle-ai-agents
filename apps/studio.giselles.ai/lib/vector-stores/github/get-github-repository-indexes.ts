import { and, eq } from "drizzle-orm";
import {
	db,
	githubRepositoryContentStatus,
	githubRepositoryIndex,
} from "@/drizzle";

type ContentTypeWithProfiles = {
	contentType: "blob" | "pull_request";
	embeddingProfileIds: number[];
};

type GitHubRepositoryIndex = {
	id: string;
	name: string;
	owner: string;
	repo: string;
	availableContentTypes: ("blob" | "pull_request")[];
	contentTypesWithProfiles?: ContentTypeWithProfiles[];
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
			embeddingProfileId: githubRepositoryContentStatus.embeddingProfileId,
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

	// Group by repository and collect available content types with embedding profiles
	const repoMap = new Map<string, GitHubRepositoryIndex>();

	for (const repo of repositories) {
		const key = `${repo.owner}/${repo.repo}`;
		const existing = repoMap.get(key);

		if (existing) {
			// Add to availableContentTypes if not already present
			if (!existing.availableContentTypes.includes(repo.contentType)) {
				existing.availableContentTypes.push(repo.contentType);
			}

			// Update contentTypesWithProfiles
			if (existing.contentTypesWithProfiles) {
				const contentTypeEntry = existing.contentTypesWithProfiles.find(
					(ct) => ct.contentType === repo.contentType,
				);
				if (contentTypeEntry) {
					if (
						!contentTypeEntry.embeddingProfileIds.includes(
							repo.embeddingProfileId,
						)
					) {
						contentTypeEntry.embeddingProfileIds.push(repo.embeddingProfileId);
					}
				} else {
					existing.contentTypesWithProfiles.push({
						contentType: repo.contentType,
						embeddingProfileIds: [repo.embeddingProfileId],
					});
				}
			}
		} else {
			repoMap.set(key, {
				id: repo.id,
				name: key,
				owner: repo.owner,
				repo: repo.repo,
				availableContentTypes: [repo.contentType],
				contentTypesWithProfiles: [
					{
						contentType: repo.contentType,
						embeddingProfileIds: [repo.embeddingProfileId],
					},
				],
			});
		}
	}

	return Array.from(repoMap.values());
}
