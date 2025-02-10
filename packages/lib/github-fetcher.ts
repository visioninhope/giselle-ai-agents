import type { Octokit } from "@octokit/core";
import type { GitHubApiPlan } from "./github-planner";

export interface GitHubApiResultBase {
	name: string;
	data: unknown;
	status: number;
}

export interface GraphQLApiResult extends GitHubApiResultBase {
	type: 'graphql';
	query: string;
	variables?: Record<string, unknown>;
}

export interface RestApiResult extends GitHubApiResultBase {
	type: 'rest';
	method: string;
	path: string;
	params?: Record<string, unknown>;
	headers?: Record<string, string>;
}

export type GitHubApiResult = GraphQLApiResult | RestApiResult;

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
				if (apiCall.type === 'graphql') {
					const result = await this.client.request("POST /graphql", {
						query: apiCall.query,
						variables: apiCall.variables,
					});
					results.push({
						type: 'graphql',
						name: apiCall.name,
						query: apiCall.query,
						variables: apiCall.variables,
						data: result.data,
						status: result.status,
					});
				} else {
					const result = await this.client.request({
						method: apiCall.method,
						url: apiCall.path,
						...apiCall.params && { params: apiCall.params },
						...apiCall.headers && { headers: apiCall.headers },
					});
					results.push({
						type: 'rest',
						name: apiCall.name,
						method: apiCall.method,
						path: apiCall.path,
						params: apiCall.params,
						headers: apiCall.headers,
						data: result.data,
						status: result.status,
					});
				}
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
