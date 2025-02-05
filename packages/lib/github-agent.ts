import { buildAppInstallationClient } from "@/services/external/github";
import { openai } from "@ai-sdk/openai";
import type { Octokit } from "@octokit/core";
import { generateText, tool } from "ai";
import { z } from "zod";

export class GitHubAgent {
	private client: Octokit;
	private constructor(client: Octokit) {
		this.client = client;
	}

	public static async build(installationId: number) {
		const client = await buildAppInstallationClient(installationId);
		return new GitHubAgent(client);
	}

	public async execute(instruction: string) {
		const res = await generateText({
			// model: anthropic("claude-3-5-sonnet-latest"),
			model: openai("gpt-4o-mini"),
			tools: this.tools,
			maxSteps: 5,
			system:
				"You are an expert of GitHub API." +
				"Follow the instruction carefully and accurately." +
				"Don't execute mutation, only query.",
			prompt: instruction,
		});

		return res.text;
	}

	public tools = {
		introspectSchema: tool({
			description:
				"Executes a GraphQL introspection query to fetch all types defined in the schema.",
			parameters: z.object({}),
			execute: async () => {
				console.log("========= introspectSchema =========");
				const res = await this.client.request("GET /graphql/schema", {
					query: `query {
            __schema {
              types {
                name
                kind
                description
                fields {
                  name
                }
              }
            }
          }`,
				});
				return JSON.stringify(res.data, null, 2);
			},
		}),
		introspectType: tool({
			description:
				"Executes a GraphQL introspection query to retrieve information about a specific type.",
			parameters: z.object({ type: z.string() }),
			execute: async ({ type }) => {
				console.log("========= introspectType =========");
				const res = await this.client.request("GET /graphql/schema", {
					query: `query {
            __type(name: ${type}) {
              name
              kind
              description
              fields {
                name
              }
            }
          }`,
				});
				return JSON.stringify(res.data, null, 2);
			},
		}),
		query: tool({
			description: "Executes a GitHub GraphQL query with optional variables.",
			parameters: z.object({
				query: z.string(),
				variables: z.record(z.any()).optional(),
			}),
			execute: async ({ query, variables }) => {
				console.log("Executing GraphQL query...");
				console.log({ query, variables });
				const res = await this.client.request("POST /graphql", {
					query,
					variables,
				});
				return JSON.stringify(res.data, null, 2);
			},
		}),
		// getRepository: tool({
		// 	description: "Get a repository",
		// 	parameters: z.object({ owner: z.string(), repo: z.string() }),
		// 	execute: async ({ owner, repo }) => {
		// 		const res = await this.client.request("GET /repos/{owner}/{repo}", {
		// 			owner,
		// 			repo,
		// 		});
		// 		return JSON.stringify(res.data, null, 2);
		// 	},
		// }),
		// getIssues: tool({
		// 	description: "List issues from a repository",
		// 	parameters: z.object({
		// 		owner: z.string(),
		// 		repo: z.string(),
		// 	}),
		// 	execute: async ({ owner, repo }) => {
		// 		const res = await this.client.request(
		// 			"GET /repos/{owner}/{repo}/issues",
		// 			{
		// 				owner,
		// 				repo,
		// 			},
		// 		);
		// 		return JSON.stringify(res.data, null, 2);
		// 	},
		// }),
		// getIssue: tool({
		// 	description: "Get issue from a repository",
		// 	parameters: z.object({
		// 		owner: z.string(),
		// 		repo: z.string(),
		// 		issueNumber: z.number(),
		// 	}),
		// 	execute: async ({ owner, repo, issueNumber }) => {
		// 		const res = await this.client.request(
		// 			"GET /repos/{owner}/{repo}/issues/{issue_number}",
		// 			{
		// 				owner,
		// 				repo,
		// 				issue_number: issueNumber,
		// 			},
		// 		);
		// 		return JSON.stringify(res.data, null, 2);
		// 	},
		// }),
	};
}
