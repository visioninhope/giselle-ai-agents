import type { Octokit } from "@octokit/core";
import type { GitHubApiPlan } from "./github-planner";

export interface GitHubApiResult {
	endpoint: string;
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
				const result = await this.client.request(
					apiCall.endpoint,
					apiCall.args,
				);
				results.push({
					endpoint: apiCall.endpoint,
					data: result.data,
					status: result.status,
				});
			} catch (error) {
				// Add type information and error details
				const apiError = error as { status?: number; message?: string };
				throw new Error(
					`Failed to execute GitHub API call ${apiCall.endpoint}: ${apiError.message} (Status: ${apiError.status})`,
				);
			}
		}

		return {
			results,
			summary: plan.summary,
		};
	}

	// Helper method to handle large responses (e.g., PR diffs)
	private async handleLargeResponse(
		endpoint: string,
		args: Record<string, unknown>,
	): Promise<LargeResponseResult> {
		const result = await this.client.request(endpoint, args);
		const responseSize = JSON.stringify(result.data).length;

		// If the response is too large, we might want to:
		// 1. Save it to a temporary file
		// 2. Return a summary or partial content
		// 3. Provide a way to access the full content later

		const isLarge = responseSize > 100000; // 100KB threshold
		if (isLarge) {
			// For now, we'll just return a summary
			// TODO: Implement proper large data handling
			return {
				summary: `Large response from ${endpoint} (${responseSize} bytes)`,
				isLarge: true,
				size: responseSize,
			};
		}

		return {
			summary: `Response from ${endpoint}`,
			isLarge: false,
			size: responseSize,
			data: result.data,
		};
	}
}
