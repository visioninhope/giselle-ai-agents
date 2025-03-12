import {
	GitHubIntegrationSetting,
	type WorkspaceId,
} from "@giselle-sdk/data-type";
import type { Storage } from "unstorage";
export type GitHubUrlInfo =
	| { owner: string; repo: string; type: "issue"; issueNumber: number }
	| {
			owner: string;
			repo: string;
			type: "issueComment";
			issueNumber: number;
			commentId: number;
	  }
	| { owner: string; repo: string; type: "pullRequest"; pullNumber: number }
	| {
			owner: string;
			repo: string;
			type: "pullRequestReviewComment";
			pullNumber: number;
			reviewId: number;
	  }
	| { owner: string; repo: string; type: "release"; tagName: string }
	| {
			owner: string;
			repo: string;
			type: "discussion";
			discussionNumber: number;
	  }
	| {
			owner: string;
			repo: string;
			type: "discussionComment";
			discussionNumber: number;
			commentId: number;
	  }
	| { owner: string; repo: string; type: "tree"; ref: string; path: string }
	| { owner: string; repo: string; type: "commit"; sha: string };

export function parseGitHubUrl(url: string): GitHubUrlInfo | null {
	try {
		const parsedUrl = new URL(url);

		// Check if it's a GitHub URL
		if (!/^(?:www\.)?github\.com$/.test(parsedUrl.hostname)) {
			return null;
		}

		// Remove the leading slash
		const path = parsedUrl.pathname.startsWith("/")
			? parsedUrl.pathname.substring(1)
			: parsedUrl.pathname;

		// Split the path into segments
		const segments = path.split("/");

		// GitHub URLs should have at least owner/repo
		if (segments.length < 2) {
			return null;
		}

		const owner = segments[0];
		const repo = segments[1];

		// If there are only two segments, it's the repo root
		if (segments.length === 2) {
			return { owner, repo, type: "tree", ref: "HEAD", path: "" };
		}

		const resourceType = segments[2];
		const hash = parsedUrl.hash;

		switch (resourceType) {
			case "issues": {
				if (segments.length < 4) return null;
				const issueNumber = Number.parseInt(segments[3], 10);
				if (Number.isNaN(issueNumber)) return null;

				// Check for issue comment
				const commentMatch = hash.match(/#issuecomment-(\d+)/);
				if (commentMatch) {
					return {
						owner,
						repo,
						type: "issueComment",
						issueNumber,
						commentId: Number.parseInt(commentMatch[1], 10),
					};
				}

				return { owner, repo, type: "issue", issueNumber };
			}

			case "pull": {
				if (segments.length < 4) return null;
				const pullNumber = Number.parseInt(segments[3], 10);
				if (Number.isNaN(pullNumber)) return null;

				// Check for review comment
				const reviewMatch = hash.match(/#discussion_r(\d+)/);
				if (reviewMatch) {
					return {
						owner,
						repo,
						type: "pullRequestReviewComment",
						pullNumber,
						reviewId: Number.parseInt(reviewMatch[1], 10),
					};
				}

				return { owner, repo, type: "pullRequest", pullNumber };
			}

			case "releases": {
				if (segments.length < 4 || segments[3] !== "tag" || segments.length < 5)
					return null;
				const tagName = decodeURIComponent(segments[4]);
				return { owner, repo, type: "release", tagName };
			}

			case "discussions": {
				if (segments.length < 4) return null;
				const discussionNumber = Number.parseInt(segments[3], 10);
				if (Number.isNaN(discussionNumber)) return null;

				// Check for discussion comment
				const commentMatch = hash.match(/#discussioncomment-(\d+)/);
				if (commentMatch) {
					return {
						owner,
						repo,
						type: "discussionComment",
						discussionNumber,
						commentId: Number.parseInt(commentMatch[1], 10),
					};
				}

				return { owner, repo, type: "discussion", discussionNumber };
			}

			case "tree": {
				if (segments.length < 4) return null;
				const ref = segments[3];
				const path = segments.slice(4).join("/");
				return { owner, repo, type: "tree", ref, path };
			}

			case "commit": {
				if (segments.length < 4) return null;
				const sha = segments[3];
				return { owner, repo, type: "commit", sha };
			}

			default:
				return null;
		}
	} catch (error) {
		return null;
	}
}

export function githubIntegrationSettingsPath(repositoryNodeId: string) {
	return `github-integrations/${repositoryNodeId}.json`;
}
export async function getGitHubIntegrationSttings(params: {
	storage: Storage;
	repositoryNodeId: string;
}) {
	const unsafeGitHubIntegrations = await params.storage.getItem(
		githubIntegrationSettingsPath(params.repositoryNodeId),
	);
	if (unsafeGitHubIntegrations === null) {
		return undefined;
	}
	return GitHubIntegrationSetting.array().parse(unsafeGitHubIntegrations);
}
export function workspaceGithubIntegrationSettingPath(
	workspaceId: WorkspaceId,
) {
	return `workspaces/${workspaceId}/github-integration.json`;
}
export async function getWorkspaceGitHubIntegrationSetting(params: {
	storage: Storage;
	workspaceId: WorkspaceId;
}) {
	const unsafeGitHubIntegration = await params.storage.getItem(
		workspaceGithubIntegrationSettingPath(params.workspaceId),
	);
	if (unsafeGitHubIntegration === null) {
		return undefined;
	}
	return GitHubIntegrationSetting.parse(unsafeGitHubIntegration);
}

export async function upsertGitHubIntegrationSetting(params: {
	storage: Storage;
	integrationSetting: GitHubIntegrationSetting;
}) {
	const githubIntegrationSettings =
		(await getGitHubIntegrationSttings({
			storage: params.storage,
			repositoryNodeId: params.integrationSetting.repositoryNodeId,
		})) ?? [];
	const index = githubIntegrationSettings?.findIndex(
		(integration) =>
			integration.workspaceId === params.integrationSetting.workspaceId,
	);
	if (index === -1) {
		await params.storage.setItem(
			githubIntegrationSettingsPath(params.integrationSetting.repositoryNodeId),
			[...githubIntegrationSettings, params.integrationSetting],
			{
				// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
				cacheControlMaxAge: 0,
			},
		);
	} else {
		await params.storage.setItem(
			githubIntegrationSettingsPath(params.integrationSetting.repositoryNodeId),
			[
				...githubIntegrationSettings.slice(0, index),
				params.integrationSetting,
				...githubIntegrationSettings.slice(index + 1),
			],
			{
				// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
				cacheControlMaxAge: 0,
			},
		);
	}
}

export async function upsertWorkspaceGitHubIntegrationSetting(params: {
	storage: Storage;
	integrationSetting: GitHubIntegrationSetting;
}) {
	await params.storage.setItem(
		workspaceGithubIntegrationSettingPath(
			params.integrationSetting.workspaceId,
		),
		params.integrationSetting,
		{
			// Disable caching by setting cacheControlMaxAge to 0 for Vercel Blob storage
			cacheControlMaxAge: 0,
		},
	);
}
