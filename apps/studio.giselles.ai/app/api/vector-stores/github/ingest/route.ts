import {
	db,
	githubRepositoryEmbeddings,
	githubRepositoryIndex,
} from "@/drizzle";
import { buildAppInstallationClient } from "@/services/external/github";
import {
	type GitHubBlobEmbedding,
	type GitHubBlobEmbeddingKey,
	type GitHubRepositoryEmbeddingStore,
	ingestBlobs,
} from "@giselle-sdk/github-vector-store";
import { captureException } from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export const maxDuration = 800;

// ingest GitHub Code
export async function GET(request: NextRequest) {
	const authHeader = request.headers.get("authorization");
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return new Response("Unauthorized", {
			status: 401,
		});
	}

	const targetGitHubRepositories = await fetchTargetGitHubRepositories();
	const embeddingStore = new GitHubRepositoryEmbeddingStoreImpl();

	for (const targetGitHubRepository of targetGitHubRepositories) {
		const { owner, repo, installationId, lastIngestedCommitSha } =
			targetGitHubRepository;
		const octokit = await createOctokit(installationId);

		await ingestBlobs({
			owner,
			repo,
			lastIngestedCommitSha,
			dependencies: {
				octokit,
				embeddingStore,
			},
		});
	}

	return new Response("ok", { status: 200 });
}

async function createOctokit(installationId: number) {
	return buildAppInstallationClient(installationId);
}

type TargetGitHubRepository = {
	owner: string;
	repo: string;
	installationId: number;
	lastIngestedCommitSha: string | null;
};

async function fetchTargetGitHubRepositories(): Promise<
	TargetGitHubRepository[]
> {
	const records = await db
		.select({
			owner: githubRepositoryIndex.owner,
			repo: githubRepositoryIndex.repo,
			installationId: githubRepositoryIndex.installationId,
			lastIngestedCommitSha: githubRepositoryIndex.lastIngestedCommitSha,
		})
		.from(githubRepositoryIndex)
		.where(eq(githubRepositoryIndex.status, "idle"));

	return records.map((record) => ({
		owner: record.owner,
		repo: record.repo,
		installationId: record.installationId,
		lastIngestedCommitSha: record.lastIngestedCommitSha,
	}));
}

class GitHubRepositoryEmbeddingStoreImpl
	implements GitHubRepositoryEmbeddingStore
{
	private async getRepositoryIndexDbId(owner: string, repo: string) {
		const records = await db
			.select({ dbId: githubRepositoryIndex.dbId })
			.from(githubRepositoryIndex)
			.where(
				and(
					eq(githubRepositoryIndex.owner, owner),
					eq(githubRepositoryIndex.repo, repo),
				),
			)
			.limit(1);
		const repositoryIndex = records[0];
		if (repositoryIndex == null) {
			throw new Error(`Repository index not found: ${owner}/${repo}`);
		}
		return repositoryIndex.dbId;
	}

	async insertBlobEmbedding(data: GitHubBlobEmbedding) {
		const repositoryIndexDbId = await this.getRepositoryIndexDbId(
			data.owner,
			data.repo,
		);
		await db.insert(githubRepositoryEmbeddings).values({
			repositoryIndexDbId,
			commitSha: data.commitSha,
			fileSha: data.fileSha,
			path: data.path,
			nodeId: data.nodeId,
			embedding: data.embedding,
			chunkIndex: data.chunkIndex,
			chunkContent: data.chunkContent,
		});
	}

	async deleteBlobEmbedding(key: GitHubBlobEmbeddingKey) {
		const repositoryIndexDbId = await this.getRepositoryIndexDbId(
			key.owner,
			key.repo,
		);
		await db
			.delete(githubRepositoryEmbeddings)
			.where(
				and(
					eq(
						githubRepositoryEmbeddings.repositoryIndexDbId,
						repositoryIndexDbId,
					),
					eq(githubRepositoryEmbeddings.path, key.path),
				),
			);
	}

	async updateBlobEmbedding(data: GitHubBlobEmbedding) {
		this.deleteBlobEmbedding(data);
		this.insertBlobEmbedding(data);
	}

	async startIngestion(owner: string, repo: string) {
		await db
			.update(githubRepositoryIndex)
			.set({ status: "running" })
			.where(
				and(
					eq(githubRepositoryIndex.owner, owner),
					eq(githubRepositoryIndex.repo, repo),
				),
			);
	}

	async completeIngestion(owner: string, repo: string, commitSha: string) {
		await db
			.update(githubRepositoryIndex)
			.set({ status: "completed", lastIngestedCommitSha: commitSha })
			.where(
				and(
					eq(githubRepositoryIndex.owner, owner),
					eq(githubRepositoryIndex.repo, repo),
				),
			);
	}

	async failIngestion(owner: string, repo: string, error: string) {
		captureException(error, {
			extra: {
				owner,
				repo,
			},
		});
		await db
			.update(githubRepositoryIndex)
			.set({ status: "failed" })
			.where(
				and(
					eq(githubRepositoryIndex.owner, owner),
					eq(githubRepositoryIndex.repo, repo),
				),
			);
	}
}
