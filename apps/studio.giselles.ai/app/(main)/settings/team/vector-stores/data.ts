import type { components } from "@octokit/openapi-types";
import { desc, eq, inArray } from "drizzle-orm";
import {
	db,
	documentEmbeddingProfiles,
	documentVectorStoreSources,
	documentVectorStores,
	githubRepositoryContentStatus,
	githubRepositoryIndex,
} from "@/drizzle";
import type { RepositoryWithStatuses } from "@/lib/vector-stores/github";
import { getGitHubIdentityState } from "@/services/accounts";
import { fetchCurrentTeam } from "@/services/teams";
import type { InstallationWithRepos } from "./types";

type DocumentVectorStoreRow = typeof documentVectorStores.$inferSelect;
type DocumentVectorStoreSourceRow =
	typeof documentVectorStoreSources.$inferSelect;

export type DocumentVectorStoreWithProfiles = DocumentVectorStoreRow & {
	embeddingProfileIds: number[];
	sources: DocumentVectorStoreSourceRow[];
};

export async function getGitHubRepositoryIndexes(): Promise<
	RepositoryWithStatuses[]
> {
	const team = await fetchCurrentTeam();

	const records = await db
		.select({
			repositoryIndex: githubRepositoryIndex,
			contentStatus: githubRepositoryContentStatus,
		})
		.from(githubRepositoryIndex)
		.leftJoin(
			githubRepositoryContentStatus,
			eq(
				githubRepositoryContentStatus.repositoryIndexDbId,
				githubRepositoryIndex.dbId,
			),
		)
		.where(eq(githubRepositoryIndex.teamDbId, team.dbId))
		.orderBy(desc(githubRepositoryIndex.dbId));

	// Group by repository
	const repositoryMap = new Map<number, RepositoryWithStatuses>();

	for (const record of records) {
		const { repositoryIndex, contentStatus } = record;

		if (!repositoryMap.has(repositoryIndex.dbId)) {
			repositoryMap.set(repositoryIndex.dbId, {
				repositoryIndex,
				contentStatuses: [],
			});
		}

		if (contentStatus) {
			const repo = repositoryMap.get(repositoryIndex.dbId);
			if (repo) {
				repo.contentStatuses.push(contentStatus);
			}
		}
	}

	return Array.from(repositoryMap.values());
}

export async function getDocumentVectorStores(): Promise<
	DocumentVectorStoreWithProfiles[]
> {
	const team = await fetchCurrentTeam();

	const records = await db
		.select({
			store: documentVectorStores,
			embeddingProfileId: documentEmbeddingProfiles.embeddingProfileId,
		})
		.from(documentVectorStores)
		.leftJoin(
			documentEmbeddingProfiles,
			eq(
				documentEmbeddingProfiles.documentVectorStoreDbId,
				documentVectorStores.dbId,
			),
		)
		.where(eq(documentVectorStores.teamDbId, team.dbId))
		.orderBy(desc(documentVectorStores.createdAt));

	const storeMap = new Map<number, DocumentVectorStoreWithProfiles>();

	for (const record of records) {
		const { store, embeddingProfileId } = record;
		const existing = storeMap.get(store.dbId);
		if (!existing) {
			storeMap.set(store.dbId, {
				...store,
				embeddingProfileIds:
					embeddingProfileId !== null && embeddingProfileId !== undefined
						? [embeddingProfileId]
						: [],
				sources: [],
			});
			continue;
		}
		if (embeddingProfileId !== null && embeddingProfileId !== undefined) {
			existing.embeddingProfileIds.push(embeddingProfileId);
		}
	}

	const storeDbIds = Array.from(storeMap.keys());
	if (storeDbIds.length === 0) {
		return [];
	}

	const sourceRecords = await db
		.select({
			storeDbId: documentVectorStoreSources.documentVectorStoreDbId,
			source: documentVectorStoreSources,
		})
		.from(documentVectorStoreSources)
		.where(
			inArray(documentVectorStoreSources.documentVectorStoreDbId, storeDbIds),
		)
		.orderBy(desc(documentVectorStoreSources.createdAt));

	for (const record of sourceRecords) {
		const store = storeMap.get(record.storeDbId);
		if (store) {
			store.sources.push(record.source);
		}
	}

	return Array.from(storeMap.values());
}

export async function getInstallationsWithRepos(): Promise<
	InstallationWithRepos[]
> {
	const githubIdentityState = await getGitHubIdentityState();

	if (githubIdentityState.status !== "authorized") {
		throw new Error("GitHub authentication required");
	}

	const userClient = githubIdentityState.gitHubUserClient;
	const installationData = await userClient.getInstallations();
	const installations = installationData.installations;

	const installationsWithRepos = await Promise.all(
		installations.map(
			async (installation: components["schemas"]["installation"]) => {
				const repos = await userClient.getRepositories(installation.id);
				const installationId = installation.id;

				if (!installation.account) {
					throw new Error("Installation account is null");
				}

				const installationName =
					"login" in installation.account
						? installation.account.login
						: installation.account.name;

				return {
					installation: {
						id: installationId,
						name: installationName,
					},
					repositories: repos.repositories.map(
						(repo: components["schemas"]["repository"]) => ({
							id: repo.id,
							owner: repo.owner.login,
							name: repo.name,
						}),
					),
				};
			},
		),
	);

	return installationsWithRepos;
}
