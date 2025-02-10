import type { Octokit } from "@octokit/core";
import type { GitHubApiPlan } from "./github-planner";

export interface GitHubApiResult {
	name: string;
	query: string;
	variables?: Record<string, unknown>;
	data: unknown;
	status: number;
}

export interface GitHubFetchResult {
	results: GitHubApiResult[];
	summary: string;
}

export interface LargeResponseResult {
	summary: string;
	isLarge: boolean;
	size: number;
	data?: unknown;
}

export class GitHubFetcher {
	constructor(private readonly client: Octokit) {}

	public async fetch(plan: GitHubApiPlan): Promise<GitHubFetchResult> {
		const results: GitHubApiResult[] = [];

		for (const apiCall of plan.plans) {
			try {
				const result = await this.client.request("POST /graphql", {
					query: apiCall.query,
					variables: apiCall.variables,
				});
				results.push({
					name: apiCall.name,
					query: apiCall.query,
					variables: apiCall.variables,
					data: result.data,
					status: result.status,
				});
			} catch (error) {
				// Add type information and error details
				const apiError = error as { status?: number; message?: string };
				throw new Error(
					`Failed to execute GitHub API call ${apiCall.name}: ${apiError.message} (Status: ${apiError.status})`,
				);
			}
		}

		return {
			results,
			summary: plan.summary,
		};
	}
}
