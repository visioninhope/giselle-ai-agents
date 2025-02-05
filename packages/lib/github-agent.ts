import { buildAppInstallationClient } from "@/services/external/github";
import { openai } from "@ai-sdk/openai";
import type { Octokit } from "@octokit/core";
import {
	InvalidToolArgumentsError,
	NoSuchToolError,
	ToolExecutionError,
	generateText,
	tool,
} from "ai";
import { z } from "zod";

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
				// model: anthropic("claude-3-5-sonnet-latest"),
				model: openai("gpt-4o-mini"),
				tools: this.tools,
				maxSteps: this.MAX_STEPS,
				toolChoice: "required",
				system:
					"You are an expert of GitHub API." +
					"Follow the instruction carefully and accurately." +
					"Schema can be introspected through introspect tool." +
					"Don't execute mutation, only query." +
					"If user requests to mutate GitHub data, you MUST reject the request.",
				prompt: instruction,
			});

			const lastToolCall = res.toolCalls.at(-1);
			if (lastToolCall != null && "steps" in lastToolCall.args) {
				for (const step of lastToolCall.args.steps) {
					console.log({ step });
				}
				console.log({ answer: lastToolCall.args.answer });
				return lastToolCall.args.answer;
			}
			console.log(JSON.stringify(res.toolCalls, null, 2));
			return res.text;
		} catch (error: unknown) {
			if (NoSuchToolError.isInstance(error)) {
				return "Error: The requested tool does not exist. Please check the available tools and try again.";
			}
			if (InvalidToolArgumentsError.isInstance(error)) {
				return "Error: Invalid arguments provided to tool. Please check the tool documentation and try again.";
			}
			if (ToolExecutionError.isInstance(error)) {
				return "Error: An error occurred while executing the tool. Please try again.";
			}
			throw error;
		}
	}

	public tools = {
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
		answer: tool({
			description: "Generates a response based on the provided question.",
			parameters: z.object({
				steps: z.array(
					z.object({
						reasoning: z.string(),
						apiCallDescription: z.string(),
					}),
				),
				answer: z.string(),
			}),
		}),
	};
}
