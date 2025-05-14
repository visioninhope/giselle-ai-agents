import type { Octokit } from "@octokit/core";
import type { ContentLoader, LoaderResult } from "@giselle-sdk/rag";
import {
  fetchDefaultBranchHead,
  loadGitHubBlob,
  traverseGitHubTree,
  type GitHubBlobMetadata,
} from "./blob-loader";

/**
 * GitHub repository loading parameters
 */
export interface GitHubRepositoryParams {
  owner: string;
  repo: string;
  commitSha?: string;
}

/**
 * File-level content loading parameters
 */
interface GitHubBlobParams {
  owner: string;
  repo: string;
  path: string;
  fileSha: string;
  commitSha: string;
}

/**
 * GitHub repository loader that streams files
 */
export class GitHubRepositoryLoader
  implements ContentLoader<GitHubRepositoryParams, GitHubBlobMetadata>
{
  constructor(
    private octokit: Octokit,
    private options = {
      maxBlobSize: 1 * 1024 * 1024, // Default 1MB
    },
  ) {}

  /**
   * Load content from a repository as a stream
   */
  async *loadStream(
    params: GitHubRepositoryParams,
  ): AsyncIterable<LoaderResult<GitHubBlobMetadata>> {
    const { owner, repo } = params;
    const commitSha =
      params.commitSha ??
      (await fetchDefaultBranchHead(this.octokit, owner, repo)).sha;

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

/**
 * Single file loader
 */
export class GitHubFileLoader
  implements ContentLoader<GitHubBlobParams, GitHubBlobMetadata>
{
  constructor(private octokit: Octokit) {}

  /**
   * Stream a single file
   */
  async *loadStream(
    params: GitHubBlobParams,
  ): AsyncIterable<LoaderResult<GitHubBlobMetadata>> {
    const { owner, repo, path, fileSha, commitSha } = params;

    // Load the blob
    const blob = await loadGitHubBlob(
      this.octokit,
      { owner, repo, path, fileSha },
      commitSha,
    );

    // Skip binary files
    if (blob === null) {
      console.warn(`${owner}/${repo}/${path} may be binary, skipping`);
      return;
    }

    // Yield as document
    yield {
      content: blob.content,
      metadata: blob.metadata,
    };
  }
}
