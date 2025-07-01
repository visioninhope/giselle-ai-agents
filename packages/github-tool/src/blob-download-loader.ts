import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import type { Document, DocumentLoader } from "@giselle-sdk/rag";
import type { Octokit } from "@octokit/core";

const execFileAsync = promisify(execFile);

export type GitHubBlobMetadata = {
	owner: string;
	repo: string;
	fileSha: string;
	path: string;
};

export type GitHubBlobDownloadLoaderParams = {
	owner: string;
	repo: string;
	commitSha: string;
};

export type GitHubBlobDownloadLoaderOptions = {
	maxBlobSize?: number;
};

export function createGitHubBlobDownloadLoader(
	octokit: Octokit,
	params: GitHubBlobDownloadLoaderParams,
	options: GitHubBlobDownloadLoaderOptions = {},
): DocumentLoader<GitHubBlobMetadata> {
	const { maxBlobSize = 1024 * 1024 } = options;
	const { owner, repo, commitSha } = params;
	const archivePath = join(tmpdir(), `${owner}-${repo}-${commitSha}.tar.gz`);
	const extractDir = join(tmpdir(), `${owner}-${repo}-${commitSha}`);
	let prepared: Promise<string> | null = null;

	function prepare(): Promise<string> {
		if (!prepared) {
			prepared = (async () => {
				await fs.mkdir(extractDir, { recursive: true });
				const { data } = await octokit.request(
					"GET /repos/{owner}/{repo}/tarball/{ref}",
					{
						owner,
						repo,
						ref: commitSha,
						request: { redirect: "follow" },
					},
				);
				const buffer = Buffer.from(data as ArrayBuffer);
				await fs.writeFile(archivePath, buffer);
				await execFileAsync("tar", ["-xzf", archivePath, "-C", extractDir]);
				const dirs = await fs.readdir(extractDir);
				if (dirs.length === 0) {
					throw new Error("No directory extracted from tarball");
				}
				return join(extractDir, dirs[0]);
			})();
		}
		return prepared;
	}

	async function* walk(dir: string): AsyncGenerator<string> {
		const entries = await fs.readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			const full = join(dir, entry.name);
			if (entry.isDirectory()) {
				yield* walk(full);
			} else if (entry.isFile()) {
				yield full;
			}
		}
	}

	function computeSha(content: Buffer): string {
		const header = Buffer.from(`blob ${content.length}\0`);
		return createHash("sha1")
			.update(Buffer.concat([header, content]))
			.digest("hex");
	}

	const loadMetadata = async function* (): AsyncIterable<GitHubBlobMetadata> {
		const root = await prepare();
		for await (const file of walk(root)) {
			const stat = await fs.stat(file);
			if (stat.size > maxBlobSize) {
				console.warn(
					`Blob size is too large: ${stat.size} bytes, skipping: ${file}`,
				);
				continue;
			}
			const content = await fs.readFile(file);
			const fileSha = computeSha(content);
			const relative = file.slice(root.length + 1);
			yield { owner, repo, fileSha, path: relative };
		}
	};

	const loadDocument = async (
		metadata: GitHubBlobMetadata,
	): Promise<Document<GitHubBlobMetadata> | null> => {
		const root = await prepare();
		const fullPath = join(root, metadata.path);
		let contentBytes: Buffer;
		try {
			contentBytes = await fs.readFile(fullPath);
		} catch {
			return null;
		}
		if (contentBytes.length > maxBlobSize) {
			console.warn(
				`Blob size is too large: ${contentBytes.length} bytes, skipping: ${metadata.path}`,
			);
			return null;
		}
		const textDecoder = new TextDecoder("utf-8", { fatal: true });
		try {
			const decodedContent = textDecoder.decode(contentBytes);
			return { content: decodedContent, metadata };
		} catch {
			return null;
		}
	};

	return { loadMetadata, loadDocument };
}
