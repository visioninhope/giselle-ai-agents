import { IssueNodeIdQuery, githubClient } from "@giselle-sdk/github-client";
import { NotFoundError, UnsupportedError } from "./error";
import { parseGitHubUrl } from "./utils";

/** @todo resolve from context  */
const token = process.env.GITHUB_TOKEN;

export async function urlToObjectID(url: string) {
	const githubUrlInfo = parseGitHubUrl(url);
	if (githubUrlInfo === null) {
		throw new Error("Invalid GitHub URL");
	}
	if (token === undefined) {
		throw new Error("GITHUB_TOKEN is not defined");
	}
	const client = githubClient(token);
	switch (githubUrlInfo.type) {
		case "issue": {
			const { data, error } = await client.query(IssueNodeIdQuery, {
				owner: githubUrlInfo.owner,
				name: githubUrlInfo.repo,
				issueNumber: githubUrlInfo.issueNumber,
			});
			if (data?.repository?.issue == null) {
				throw new NotFoundError(
					`Issue not found: ${githubUrlInfo.owner}/${githubUrlInfo.repo}#${githubUrlInfo.issueNumber}`,
				);
			}
			return data.repository.issue.id;
		}
		case "issueComment":
		case "pullRequest":
		case "pullRequestReviewComment":
		case "discussion":
		case "discussionComment":
		case "commit":
		case "release":
		case "tree":
			throw new UnsupportedError(
				`Unsupported GitHub URL type: ${githubUrlInfo.type}`,
			);
		default: {
			const _exhaustiveCheck: never = githubUrlInfo;
			throw new Error(`Unsupported GitHub URL type: ${_exhaustiveCheck}`);
		}
	}
}
