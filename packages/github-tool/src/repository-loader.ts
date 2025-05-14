import type { ContentLoader, LoaderResult } from "@giselle-sdk/rag";
import type { Octokit } from "@octokit/core";
import {
	type GitHubBlobMetadata,
	loadGitHubBlob,
	traverseGitHubTree,
} from "./blob-loader";

/**
 * GitHub repository loading parameters
 */
export interface GitHubRepositoryParams {
	owner: string;
	repo: string;
	commitSha: string;
	baseCommitSha?: string; // for diffing
}

/**
 * GitHub repository loader that streams files
 */
export class GitHubRepositoryLoader
	implements ContentLoader<GitHubRepositoryParams, GitHubBlobMetadata> {
	private octokit: Octokit;
	private options: { maxBlobSize: number };

	constructor(
		octokit: Octokit,
		options: {
			maxBlobSize: number;
		},
	) {
		this.octokit = octokit;
		this.options = options;
	}

	/**
	 * Load content from a repository as a stream
	 */
	async *loadStream(
		params: GitHubRepositoryParams,
	): AsyncIterable<LoaderResult<GitHubBlobMetadata>> {
		const { owner, repo } = params;
		const commitSha = params.commitSha;

		console.log(`Loading repository ${owner}/${repo} at commit ${commitSha}`);

		// Traverse the repository tree
		for await (const entry of traverseGitHubTree(
			this.octokit,
			owner,
			repo,
			commitSha,
		)) {
			const { path, type, sha: fileSha, size } = entry;

			// Process only blob entries (files)
			if (type !== "blob" || !fileSha || !size || !path) {
				continue;
			}

			// Skip files that are too large
			if (size > this.options.maxBlobSize) {
				console.warn(
					`Blob size is too large: ${size} bytes, skipping: ${path}`,
				);
				continue;
			}

			// Load the blob
			const blob = await loadGitHubBlob(
				this.octokit,
				{ owner, repo, path, fileSha },
				commitSha,
			);

			// Skip binary files
			if (blob === null) {
				continue;
			}

			// Yield as document
			yield {
				content: blob.content,
				metadata: blob.metadata,
			};
		}
	}
}
