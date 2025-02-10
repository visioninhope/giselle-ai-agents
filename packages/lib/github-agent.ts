import { agents, db, githubIntegrationSettings } from "@/drizzle";
import {
	buildAppClient,
	buildAppInstallationClient,
} from "@/services/external/github";
import { openai } from "@ai-sdk/openai";
import type { Octokit } from "@octokit/core";
import type { LanguageModelUsage } from "ai";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { AgentId } from "../types";
import type { GitHubIntegrationSetting } from "./github";
import { type GitHubApiResult, GitHubFetcher } from "./github-fetcher";
import { type GitHubApiPlan, GitHubPlanner } from "./github-planner";

export async function fetchGitHubIntegrationSetting(agentId: AgentId) {
	const res = await db
		.select()
		.from(githubIntegrationSettings)
		.innerJoin(agents, eq(githubIntegrationSettings.agentDbId, agents.dbId))
		.where(eq(agents.id, agentId))
		.limit(1);
	if (res.length === 0) {
		throw new Error("GitHub integration setting not found");
	}
	return res[0].github_integration_settings;
}

// Fetch installation id from repository name
// FIXME: add githubIntegrationSetting.installationId column is preferred
export async function fetchInstallationId(
	integrationSetting: GitHubIntegrationSetting,
) {
	const appClient = await buildAppClient();
	const [owner, repo] = integrationSetting.repositoryFullName.split("/");
	const { data: installation } = await appClient.request(
		"GET /repos/{owner}/{repo}/installation",
		{
			owner,
			repo,
		},
	);
	return installation.id;
}

export const githubArtifactSchema = z.object({
	plan: z
		.string()
		.describe(
			"How do you create the artifact. It must includes what resource to retrieve and what API calls to make.",
		),
	title: z.string().describe("The title of the artifact"),
	content: z
		.string()
		.describe("The content of the artifact formatted markdown."),
	description: z
		.string()
		.describe(
			"Explanation of the Artifact and what the intention was in creating this Artifact. Add any suggestions for making it even better. This includes what API calls are made and what resources are retrieved.",
		),
});

export type GitHubArtifact = z.infer<typeof githubArtifactSchema>;

export class GitHubAgent {
	private readonly planner: GitHubPlanner;
	private readonly fetcher: GitHubFetcher;
	readonly MODEL = openai("gpt-4o-mini");

	private constructor(client: Octokit) {
		this.planner = new GitHubPlanner(this.MODEL);
		this.fetcher = new GitHubFetcher(client);
	}

	public static async build(installationId: number) {
		const client = await buildAppInstallationClient(installationId);
		return new GitHubAgent(client);
	}

	public async execute(prompt: string): Promise<{
		plan: GitHubApiPlan;
		artifact: GitHubArtifact;
		usage: LanguageModelUsage;
	}> {
		try {
			// 1. Plan: Get API calls plan from LLM
			const { plan, usage } = await this.planner.plan(prompt);

			// 2. Fetch: Execute the planned API calls
			const fetchResult = await this.fetcher.fetch(plan);

			// 3. Format the result as a GitHubArtifact
			const artifact: GitHubArtifact = {
				plan: JSON.stringify(plan, null, 2),
				title: `GitHub API Results: ${plan.summary}`,
				content: this.formatResults(fetchResult.results),
				description:
					`Executed ${plan.plans.length} GitHub API calls to ${plan.summary}. ` +
					`The results include data from: ${plan.plans.map((p) => p.endpoint).join(", ")}`,
			};

			return { plan, artifact, usage };
		} catch (error) {
			const err = error as Error;
			throw new Error(`GitHub API execution failed: ${err.message}`);
		}
	}

	private formatResults(results: GitHubApiResult[]): string {
		// Format the results as a markdown string
		let markdown = "";

		for (const result of results) {
			markdown += `### ${result.endpoint} (Status: ${result.status})\n\n`;
			markdown += "```json\n";
			markdown += JSON.stringify(result.data, null, 2);
			markdown += "\n```\n\n";
		}

		return markdown;
	}
}
