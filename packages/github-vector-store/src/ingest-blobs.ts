import type { Octokit } from "@octokit/core";
import { chunkByLines } from "./chunk";
import { embed } from "./embed";

export interface GitHubRepositoryEmbeddingStore {
	startIngestion(owner: string, repo: string): Promise<void>;
	completeIngestion(
		owner: string,
		repo: string,
		commitSha: string,
	): Promise<void>;
	failIngestion(owner: string, repo: string, error: string): Promise<void>;
	// TODO: When ingestion is implemented as a queue, we need to check if the all ingestion job is completed like this:
	// allIngestionCompleted(owner: string, repo: string): Promise<boolean>;

	insertBlobEmbedding(data: GitHubBlobEmbedding): Promise<void>;
	updateBlobEmbedding(data: GitHubBlobEmbedding): Promise<void>;
	deleteBlobEmbedding(key: GitHubBlobEmbeddingKey): Promise<void>;
}

export type GitHubBlobEmbedding = {
	owner: string;
	repo: string;
	commitSha: string;
	fileSha: string;
	path: string;
	nodeId: string;
	chunkIndex: number;
	chunkContent: string;
	embedding: number[];
};

export type GitHubBlobEmbeddingKey = Pick<
	GitHubBlobEmbedding,
	"owner" | "repo" | "path"
>;

type IngestBlobsParams = {
	owner: string;
	repo: string;
	lastIngestedCommitSha: string | null;
	dependencies: {
		octokit: Octokit;
		embeddingStore: GitHubRepositoryEmbeddingStore;
	};
};

export async function ingestBlobs(params: IngestBlobsParams) {
	const { owner, repo, lastIngestedCommitSha, dependencies } = params;
	const { octokit, embeddingStore } = dependencies;

	if (lastIngestedCommitSha == null) {
		await fullIngest(octokit, owner, repo, embeddingStore);
	} else {
		await diffIngest(
			octokit,
			owner,
			repo,
			lastIngestedCommitSha,
			embeddingStore,
		);
	}
}

async function fullIngest(
	octokit: Octokit,
	owner: string,
	repo: string,
	embeddingStore: GitHubRepositoryEmbeddingStore,
	maxBlobSize: number = 1 * 1024 * 1024, // 1MiB
) {
	const head = await fetchDefaultBranchHead(octokit, owner, repo);
	const commitSha = head.sha;
	try {
		await embeddingStore.startIngestion(owner, repo);
		for await (const entry of traverseTree(octokit, owner, repo, commitSha)) {
			const { path, type, sha: fileSha, size } = entry;

			// only ingest blobs
			if (type !== "blob") {
				continue;
			}

			if (fileSha == null || size == null || path == null) {
				console.warn(`Invalid entry: ${JSON.stringify(entry)}`);
				continue;
			}
			if (size > maxBlobSize) {
				console.warn(
					`Blob size is too large: ${size} bytes, skipping: ${fileSha}`,
				);
				continue;
			}

			// TODO: Use queue
			await ingestBlob(
				octokit,
				owner,
				repo,
				path,
				fileSha,
				commitSha,
				embeddingStore,
			);
		}

		// TODO: When we implement ingestion as a queue, this method should be called in an ingestBlob Job with checking if the all ingestion job is completed
		await embeddingStore.completeIngestion(owner, repo, commitSha);
	} catch (error: unknown) {
		if (error instanceof Error) {
			await embeddingStore.failIngestion(owner, repo, error.message);
		} else {
			await embeddingStore.failIngestion(owner, repo, String(error));
		}
	}
}

// TODO: Implement this
async function diffIngest(
	octokit: Octokit,
	owner: string,
	repo: string,
	lastIngestedCommitSha: string,
	embeddingStore: GitHubRepositoryEmbeddingStore,
) {
	throw new Error("Not implemented");
}

async function ingestBlob(
	octokit: Octokit,
	owner: string,
	repo: string,
	path: string,
	fileSha: string,
	commitSha: string,
	embeddingStore: GitHubRepositoryEmbeddingStore,
) {
	// fetch
	const blob = await fetchBlob(octokit, owner, repo, fileSha);
	if (blob === null) {
		console.warn(`${owner}/${repo}/${fileSha} may be binary, skipping`);
		return;
	}

	// chunk
	for await (const chunk of chunkByLines(blob.content)) {
		if (chunk.content.length === 0) {
			continue;
		}
		// embed
		const embedding = await embed(chunk.content);
		// store
		await embeddingStore.insertBlobEmbedding({
			owner,
			repo,
			commitSha,
			fileSha,
			path,
			nodeId: blob.nodeId,
			chunkIndex: chunk.index,
			chunkContent: chunk.content,
			embedding,
		});
	}
}

async function fetchBlob(
	octokit: Octokit,
	owner: string,
	repo: string,
	fileSha: string,
	currentAttempt = 0,
	maxAttempt = 3,
) {
	// Note This endpoint supports blobs up to 100 megabytes in size.
	// https://docs.github.com/ja/rest/git/blobs?apiVersion=2022-11-28#get-a-blob
	const { data: blobData, status } = await octokit.request(
		"GET /repos/{owner}/{repo}/git/blobs/{file_sha}",
		{
			owner,
			repo,
			file_sha: fileSha,
		},
	);
	if (status >= 500) {
		if (currentAttempt >= maxAttempt) {
			throw new Error(
				`Network error: ${status} when fetching ${owner}/${repo}/${fileSha}`,
			);
		}
		// exponential backoff
		await new Promise((resolve) =>
			setTimeout(resolve, 2 ** currentAttempt * 100),
		);
		return fetchBlob(
			octokit,
			owner,
			repo,
			fileSha,
			currentAttempt + 1,
			maxAttempt,
		);
	}
	if (blobData.encoding !== "base64") {
		return null;
	}
	const contentInBytes = Buffer.from(blobData.content, "base64");
	// We want to know if the blob is binary or not, so we use the `fatal` option
	const textDecoder = new TextDecoder("utf-8", { fatal: true });
	try {
		const decodedContent = textDecoder.decode(contentInBytes);
		return {
			content: decodedContent,
			nodeId: blobData.node_id,
		};
	} catch (error: unknown) {
		return null;
	}
}

async function* traverseTree(
	octokit: Octokit,
	owner: string,
	repo: string,
	treeSha: string,
) {
	const { data: treeData } = await octokit.request(
		"GET /repos/{owner}/{repo}/git/trees/{tree_sha}",
		{
			owner,
			repo,
			tree_sha: treeSha,
			recursive: "true",
		},
	);
	if (treeData.truncated) {
		/**
		 * The limit for the tree array is 100,000 entries with a maximum size of 7 MB when using the recursive parameter.
		 * https://docs.github.com/ja/rest/git/trees?utm_source=chatgpt.com#get-a-tree
		 *
		 * If this limit is exceeded, please consider another way to ingest the repository.
		 * For example, you can use the git clone or GET tarball API for first time ingestion.
		 */
		throw new Error(`Tree is truncated: ${owner}/${repo}/${treeData.sha}`);
	}

	for (const entry of treeData.tree) {
		yield entry;
	}
}

async function fetchDefaultBranchHead(
	octokit: Octokit,
	owner: string,
	repo: string,
) {
	const { data: repoData } = await octokit.request(
		"GET /repos/{owner}/{repo}",
		{
			owner,
			repo,
		},
	);
	const defaultBranch = repoData.default_branch;
	const { data: branchData } = await octokit.request(
		"GET /repos/{owner}/{repo}/branches/{branch}",
		{
			owner,
			repo,
			branch: defaultBranch,
		},
	);
	return branchData.commit;
}
