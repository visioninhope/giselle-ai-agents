import { buildAppInstallationClient } from "@/services/external/github";
import { openai } from "@ai-sdk/openai";
import type { Octokit } from "@octokit/core";
import {
	InvalidToolArgumentsError,
	NoSuchToolError,
	Output,
	ToolExecutionError,
	generateText,
	tool,
} from "ai";
import { z } from "zod";

export const githubArtifactSchema = z.object({
	plan: z
		.string()
		.describe(
			"How do you create the artifact. It must includes what resource to retrieve and what API calls to make.",
		),
	title: z.string().describe("The title of the artifact"),
	content: z
		.string()
		.describe("The content of the artefact formatted markdown."),
	description: z
		.string()
		.describe(
			"Explanation of the Artifact and what the intention was in creating this Artifact. Add any suggestions for making it even better.This includes what API calls are made and what resources are retrieved.",
		),
});

export type GitHubArtifact = z.infer<typeof githubArtifactSchema>;

export class GitHubAgent {
	readonly MAX_STEPS = 5;

	private client: Octokit;
	private constructor(client: Octokit) {
		this.client = client;
	}

	public static async build(installationId: number) {
		const client = await buildAppInstallationClient(installationId);
		return new GitHubAgent(client);
	}

	public async execute(instruction: string) {
		try {
			const res = await generateText({
				model: openai("gpt-4o-mini"),
				tools: this.tools(),
				maxSteps: this.MAX_STEPS,
				experimental_output: Output.object({
					schema: githubArtifactSchema,
				}),
				system:
					"You are an expert of GitHub API." +
					"Follow the instruction carefully and accurately." +
					"Schema can be introspected through introspect tool." +
					"Don't execute mutation, only query." +
					"If user requests to mutate GitHub data, you MUST reject the request.",
				prompt: instruction,
			});

			return res.experimental_output;
		} catch (error: unknown) {
			if (NoSuchToolError.isInstance(error)) {
				throw new Error(
					"The requested tool does not exist. Please check the available tools and try again.",
				);
			}
			if (InvalidToolArgumentsError.isInstance(error)) {
				throw new Error(
					"Invalid arguments provided to tool. Please check the tool documentation and try again.",
				);
			}
			if (ToolExecutionError.isInstance(error)) {
				throw new Error(
					"An error occurred while executing the tool. Please try again.",
				);
			}
			throw error;
		}
	}

	private tools() {
		return {
			query: tool({
				description: "Executes a GitHub GraphQL query with optional variables.",
				parameters: z.object({
					query: z.string(),
					variables: z.record(z.any()).optional(),
				}),
				execute: async ({ query, variables }) => {
					const res = await this.client.request("POST /graphql", {
						query,
						variables,
					});
					return res.data;
				},
			}),
		};
	}
}
