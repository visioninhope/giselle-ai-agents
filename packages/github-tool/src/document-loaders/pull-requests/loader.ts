import type { Document, DocumentLoader } from "@giselle-sdk/rag";
import { DocumentLoaderError } from "@giselle-sdk/rag";
import type { Octokit } from "@octokit/core";
import { RequestError } from "@octokit/request-error";
import type {
	GitHubPullRequestMetadata,
	GitHubPullRequestsLoaderConfig,
} from "./types";

// Internal types for API responses
type PullRequestListItem = {
	number: number;
};

type PullRequestDetail = {
	title: string;
	body: string | null;
	merged: boolean;
	merged_at: string | null;
};

type IssueComment = {
	id: number;
	body: string;
	user: {
		type: string;
	} | null;
};

type PullRequestFile = {
	filename: string;
	patch?: string;
};

const DEFAULT_DIFF_IGNORE_FILE_PATTERNS = [
	"*.lock",
	"pnpm-lock.yaml",
	"package-lock.json",
	"yarn.lock",
	"*.png",
	"*.jpg",
	"*.jpeg",
	"*.gif",
	"*.svg",
	"*.ico",
	"*.pdf",
	"*.zip",
	"*.tar",
	"*.gz",
	"*.woff",
	"*.woff2",
	"*.ttf",
	"*.eot",
	"*.bin",
	"*.exe",
	"*.dll",
	"*.so",
	"*.dylib",
	"*.wasm",
];

/**
 * Creates a GitHub Pull Requests loader for document extraction
 * Only processes merged pull requests (immutable content for vector search)
 *
 * @example
 * ```typescript
 * // Basic usage
 * const loader = createGitHubPullRequestsLoader(octokit, {
 *   owner: "giselles-ai",
 *   repo: "giselle",
 * });
 *
 * // With custom configuration
 * const loader = createGitHubPullRequestsLoader(octokit, {
 *   owner: "giselles-ai",
 *   repo: "giselle",
 *   perPage: 100,    // Fetch 100 PRs per page
 *   maxPages: 10,    // Process up to 1000 PRs
 *
 *   // Filter options
 *   skipGeneratedFiles: true,    // Skip auto-generated files
 *   skipBotComments: true,       // Skip bot noise
 *   maxDiffSize: 1024 * 50,      // 50KB limit per file
 *   maxCommentLength: 1024 * 10, // 10KB limit per comment
 *   skipFiles: [
 *     // These patterns will be added to the default diff ignore patterns
 *     // (which includes images, executables, archives, and lock files)
 *     "*.generated.ts",
 *     "*.pb.go",
 *     "schema.graphql",
 *   ],
 * });
 * ```
 */

/**
 * Check if file should be ignored for diff processing
 * Uses glob-like pattern matching to exclude unwanted files from diff documents
 */
function shouldIgnoreFile(
	file: PullRequestFile,
	skipPatterns: string[],
): boolean {
	// Pattern matching to filter out unwanted files
	return skipPatterns.some((pattern) => {
		if (pattern.startsWith("*.")) {
			// Handle *.ext patterns
			return file.filename.endsWith(pattern.slice(1));
		}
		// Handle exact filename matches
		return file.filename === pattern || file.filename.endsWith(pattern);
	});
}

/**
 * Heuristic detection for generated files based on filename patterns
 * This is not from GitHub API but follows common conventions
 */
function isLikelyGeneratedFile(filename: string): boolean {
	const generatedPatterns = [
		// Common generated file patterns
		/\.generated\./i,
		/\.gen\./i,
		/^generated\//i,
		/\/generated\//i,
		/\.min\./i,
		/\.bundle\./i,
		/dist\//i,
		/build\//i,
		/\.pb\./i, // Protocol Buffers
		/\.g\./i, // Various code generators

		// Specific files
		/^package-lock\.json$/,
		/^pnpm-lock\.yaml$/,
		/^yarn\.lock$/,
		/\.lock$/,

		// Common build outputs
		/\.(map|d\.ts|js\.map)$/,
		/\.tsbuildinfo$/,
	];

	return generatedPatterns.some((pattern) => pattern.test(filename));
}

// Cache for PR data to avoid duplicate API calls
const prCache = new Map<
	string,
	{
		pr?: PullRequestDetail;
		comments?: IssueComment[];
		files?: PullRequestFile[];
		timestamp: number;
	}
>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function createGitHubPullRequestsLoader(
	octokit: Octokit,
	config: GitHubPullRequestsLoaderConfig,
): DocumentLoader<GitHubPullRequestMetadata> {
	// Extract all config values
	const {
		// Repository
		owner,
		repo,

		// Pagination (optimized for vector search)
		perPage = 100,
		maxPages = 10,

		// Processing options
		maxDiffSize = 1024 * 1024,
		maxCommentLength = 1024 * 10,
		skipFiles = [],
		skipBotComments = true,
		skipGeneratedFiles = false,
	} = config;

	// Merge user-provided skipFiles with default diff ignore patterns
	const mergedSkipFiles = [...DEFAULT_DIFF_IGNORE_FILE_PATTERNS, ...skipFiles];

	const loadMetadata =
		async function* (): AsyncIterable<GitHubPullRequestMetadata> {
			// Fetch closed pull requests (to get merged ones)
			// Always use "created" and "desc" for consistent ordering
			const pullRequests = await fetchAllPullRequests(octokit, owner, repo, {
				state: "closed",
				sort: "created",
				direction: "desc",
				perPage,
				maxPages,
			});

			for (const pr of pullRequests) {
				const cacheKey = `${owner}/${repo}/${pr.number}`;

				try {
					// Always skip non-merged PRs (only process merged PRs)
					const prDetail = await getCachedPullRequest(
						octokit,
						owner,
						repo,
						pr.number,
						cacheKey,
					);
					if (!prDetail.merged || !prDetail.merged_at) {
						continue;
					}

					// 1. Title + Body document
					yield {
						owner,
						repo,
						pr_number: pr.number,
						content_type: "title_body",
						content_id: "title_body",
						merged_at: prDetail.merged_at,
					};

					// 2. Comments documents
					try {
						const comments = await getCachedComments(
							octokit,
							owner,
							repo,
							pr.number,
							cacheKey,
						);

						for (const comment of comments) {
							if (skipBotComments && comment.user?.type === "Bot") {
								continue;
							}

							if (!comment.body || comment.body.length > maxCommentLength) {
								continue;
							}

							yield {
								owner,
								repo,
								pr_number: pr.number,
								content_type: "comment",
								content_id: comment.id.toString(),
								merged_at: prDetail.merged_at,
							};
						}
					} catch (error) {
						console.error(
							`Failed to process comments for PR #${pr.number}:`,
							error,
						);
					}

					// 3. File diffs documents
					try {
						const files = await getCachedFiles(
							octokit,
							owner,
							repo,
							pr.number,
							cacheKey,
						);

						for (const file of files) {
							// Skip files based on ignore patterns
							if (shouldIgnoreFile(file, mergedSkipFiles)) {
								continue;
							}

							// Skip likely generated files if enabled
							if (skipGeneratedFiles && isLikelyGeneratedFile(file.filename)) {
								continue;
							}

							// Skip files without patch (no diff content)
							if (!file.patch) {
								continue;
							}

							// Check diff size limit for text files
							if (file.patch && file.patch.length > maxDiffSize) {
								continue;
							}

							yield {
								owner,
								repo,
								pr_number: pr.number,
								content_type: "diff",
								content_id: file.filename,
								merged_at: prDetail.merged_at,
							};
						}
					} catch (error) {
						console.error(
							`Failed to process files for PR #${pr.number}:`,
							error,
						);
					}
				} catch (error) {
					console.error(`Failed to process PR #${pr.number}:`, error);
				}
			}
		};

	const loadDocument = async (
		metadata: GitHubPullRequestMetadata,
	): Promise<Document<GitHubPullRequestMetadata> | null> => {
		const { pr_number, content_type, content_id } = metadata;
		const cacheKey = `${owner}/${repo}/${pr_number}`;

		try {
			switch (content_type) {
				case "title_body": {
					const pr = await getCachedPullRequest(
						octokit,
						owner,
						repo,
						pr_number,
						cacheKey,
					);
					const content = `${pr.title}\n\n${pr.body || ""}`;

					return {
						content,
						metadata: {
							...metadata,
							// Ensure merged_at is consistent
							merged_at: pr.merged_at || metadata.merged_at,
						},
					};
				}

				case "comment": {
					const pr = await getCachedPullRequest(
						octokit,
						owner,
						repo,
						pr_number,
						cacheKey,
					);

					const comments = await getCachedComments(
						octokit,
						owner,
						repo,
						pr_number,
						cacheKey,
					);
					const comment = comments.find((c) => c.id.toString() === content_id);

					if (!comment || !comment.body) {
						return null;
					}

					return {
						content: comment.body,
						metadata: {
							...metadata,
							merged_at: pr.merged_at || metadata.merged_at,
						},
					};
				}

				case "diff": {
					const pr = await getCachedPullRequest(
						octokit,
						owner,
						repo,
						pr_number,
						cacheKey,
					);

					const files = await getCachedFiles(
						octokit,
						owner,
						repo,
						pr_number,
						cacheKey,
					);
					const file = files.find((f) => f.filename === content_id);

					if (!file || shouldIgnoreFile(file, mergedSkipFiles) || !file.patch) {
						return null;
					}

					const content = `File: ${file.filename}\n\n${file.patch}`;

					return {
						content,
						metadata: {
							...metadata,
							merged_at: pr.merged_at || metadata.merged_at,
						},
					};
				}

				default:
					return null;
			}
		} catch (error) {
			console.error(`Failed to load document for metadata:`, metadata, error);
			return null;
		}
	};

	return { loadMetadata, loadDocument };
}

// Cache helper functions
async function getCachedPullRequest(
	octokit: Octokit,
	owner: string,
	repo: string,
	prNumber: number,
	cacheKey: string,
): Promise<PullRequestDetail> {
	const cached = prCache.get(cacheKey);
	const now = Date.now();

	if (cached?.pr && now - cached.timestamp < CACHE_TTL) {
		return cached.pr;
	}

	const pr = await fetchPullRequest(octokit, owner, repo, prNumber);

	prCache.set(cacheKey, {
		...cached,
		pr,
		timestamp: now,
	});

	return pr;
}

async function getCachedComments(
	octokit: Octokit,
	owner: string,
	repo: string,
	prNumber: number,
	cacheKey: string,
): Promise<IssueComment[]> {
	const cached = prCache.get(cacheKey);
	const now = Date.now();

	if (cached?.comments && now - cached.timestamp < CACHE_TTL) {
		return cached.comments;
	}

	const comments = await fetchIssueComments(octokit, owner, repo, prNumber);

	prCache.set(cacheKey, {
		...(cached || {}),
		comments,
		timestamp: now,
	});

	return comments;
}

async function getCachedFiles(
	octokit: Octokit,
	owner: string,
	repo: string,
	prNumber: number,
	cacheKey: string,
): Promise<PullRequestFile[]> {
	const cached = prCache.get(cacheKey);
	const now = Date.now();

	if (cached?.files && now - cached.timestamp < CACHE_TTL) {
		return cached.files;
	}

	const files = await fetchPullRequestFiles(octokit, owner, repo, prNumber);

	prCache.set(cacheKey, {
		...(cached || {}),
		files,
		timestamp: now,
	});

	return files;
}

/**
 * Execute an Octokit request with retry logic for 5xx errors
 */
async function executeWithRetry<T>(
	operation: () => Promise<T>,
	resourceType: string,
	resourcePath: string,
	currentAttempt = 0,
	maxAttempt = 3,
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		if (error instanceof RequestError) {
			// Handle 5xx errors with retry
			if (error.status && error.status >= 500) {
				if (currentAttempt >= maxAttempt) {
					throw DocumentLoaderError.fetchError(
						"github",
						`fetching ${resourceType}`,
						error,
						{
							statusCode: error.status,
							resourceType,
							resourcePath,
							retryAttempts: currentAttempt,
							maxAttempts: maxAttempt,
						},
					);
				}
				await new Promise((resolve) =>
					setTimeout(resolve, 2 ** currentAttempt * 1000),
				);
				return executeWithRetry(
					operation,
					resourceType,
					resourcePath,
					currentAttempt + 1,
					maxAttempt,
				);
			}

			// Handle 404 errors
			if (error.status === 404) {
				throw DocumentLoaderError.notFound(resourcePath, error, {
					source: "github",
					resourceType,
					statusCode: 404,
				});
			}

			// Handle rate limit errors (403, 429)
			if (error.status === 403 || error.status === 429) {
				throw DocumentLoaderError.rateLimited(
					"github",
					error.response?.headers?.["retry-after"],
					error,
					{
						statusCode: error.status,
						resourceType,
						resourcePath,
					},
				);
			}

			// Other 4xx errors
			if (error.status && error.status >= 400 && error.status < 500) {
				throw DocumentLoaderError.fetchError(
					"github",
					`fetching ${resourceType}`,
					error,
					{
						statusCode: error.status,
						resourceType,
						resourcePath,
						errorMessage: error.message,
					},
				);
			}
		}
		// Re-throw any other errors
		throw error;
	}
}

// API fetch functions
async function fetchAllPullRequests(
	octokit: Octokit,
	owner: string,
	repo: string,
	options: {
		state: "open" | "closed" | "all";
		sort: "created" | "updated" | "popularity" | "long-running";
		direction: "asc" | "desc";
		perPage: number;
		maxPages: number;
	},
): Promise<PullRequestListItem[]> {
	const pullRequests: PullRequestListItem[] = [];
	let page = 1;

	while (page <= options.maxPages) {
		const { data } = await executeWithRetry(
			() =>
				octokit.request("GET /repos/{owner}/{repo}/pulls", {
					owner,
					repo,
					state: options.state,
					sort: options.sort,
					direction: options.direction,
					per_page: options.perPage,
					page,
				}),
			"Pull Requests",
			`${owner}/${repo}/pulls`,
		);

		if (data.length === 0) {
			break;
		}

		// Extract only essential fields for lightweight metadata
		pullRequests.push(
			...data.map((pr) => ({
				number: pr.number,
			})),
		);

		if (data.length < options.perPage) {
			break;
		}

		page++;
	}

	return pullRequests;
}

async function fetchPullRequest(
	octokit: Octokit,
	owner: string,
	repo: string,
	prNumber: number,
): Promise<PullRequestDetail> {
	const { data } = await executeWithRetry(
		() =>
			octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
				owner,
				repo,
				pull_number: prNumber,
			}),
		"Pull Request",
		`${owner}/${repo}/pulls/${prNumber}`,
	);

	return {
		title: data.title,
		body: data.body,
		merged: data.merged ?? false,
		merged_at: data.merged_at,
	};
}

async function fetchIssueComments(
	octokit: Octokit,
	owner: string,
	repo: string,
	prNumber: number,
): Promise<IssueComment[]> {
	const comments: IssueComment[] = [];
	let page = 1;

	while (true) {
		const { data } = await executeWithRetry(
			() =>
				octokit.request(
					"GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
					{
						owner,
						repo,
						issue_number: prNumber,
						per_page: 100,
						page,
					},
				),
			"Issue Comments",
			`${owner}/${repo}/issues/${prNumber}/comments`,
		);

		if (data.length === 0) {
			break;
		}

		comments.push(
			...data.map((comment) => ({
				id: comment.id,
				body: comment.body ?? "",
				user: comment.user ? { type: comment.user.type } : null,
			})),
		);

		if (data.length < 100) {
			break;
		}

		page++;
	}

	return comments;
}

async function fetchPullRequestFiles(
	octokit: Octokit,
	owner: string,
	repo: string,
	prNumber: number,
): Promise<PullRequestFile[]> {
	const files: PullRequestFile[] = [];
	let page = 1;

	while (true) {
		const { data } = await executeWithRetry(
			() =>
				octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}/files", {
					owner,
					repo,
					pull_number: prNumber,
					per_page: 100,
					page,
				}),
			"Pull Request Files",
			`${owner}/${repo}/pulls/${prNumber}/files`,
		);

		if (data.length === 0) {
			break;
		}

		files.push(
			...data.map((file) => ({
				filename: file.filename,
				patch: file.patch,
			})),
		);

		if (data.length < 100) {
			break;
		}

		page++;
	}

	return files;
}
