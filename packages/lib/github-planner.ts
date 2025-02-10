import {
	type LanguageModelUsage,
	type LanguageModelV1,
	Output,
	generateText,
} from "ai";
import { z } from "zod";

// Schema for the API plan that the LLM will generate
export const githubApiPlanSchema = z.object({
	plans: z.array(
		z.object({
			name: z.string().describe("The name of this API call."),
			query: z.string().describe("The GitHub GraphQL query to execute."),
			variables: z
				.record(z.string(), z.unknown())
				.optional()
				.describe("Variables to pass to the query."),
		}),
	),
	summary: z
		.string()
		.describe("A brief summary of what these API calls will accomplish"),
});

export type GitHubApiPlan = z.infer<typeof githubApiPlanSchema>;

export class GitHubPlanner {
	private readonly model: LanguageModelV1;

	constructor(model: LanguageModelV1) {
		this.model = model;
	}

	public async plan(
		instruction: string,
	): Promise<{ plan: GitHubApiPlan; usage: LanguageModelUsage }> {
		const res = await generateText({
			model: this.model,
			experimental_output: Output.object({
				schema: githubApiPlanSchema,
			}),
			temperature: 0,
			system: `You are a GitHub API planner focused on creating plans for retrieving data through the GitHub GraphQL API.

Primary Goals:
- Plan GitHub GraphQL queries based on user instructions
- Return a structured plan with exact GraphQL queries and variables
- Break down complex tasks into multiple queries when necessary
- Never include mutations or repository modifications in your plans

Guidelines:
1. Always use the official GitHub GraphQL API schema
2. Include all necessary variables in the variables object
3. Break down complex tasks into multiple queries if needed
4. Consider rate limits and data size when planning
5. Provide clear summaries of what each query will accomplish

Example plan for "Get information about a pull request":
{
  "plans": [
    {
      "name": "Get pull request information",
      "query": "query($owner: String!, $repo: String!, $number: Int!) { repository(owner: $owner, name: $repo) { pullRequest(number: $number) { title state author { login } createdAt } } }",
      "variables": {
        "owner": "octocat",
        "repo": "hello-world",
        "number": 1
      }
    }
  ],
  "summary": "Retrieve basic information about pull request #1 using GraphQL"
`,
			prompt: instruction,
		});

		console.log("plan =================");
		console.dir(res.experimental_output, { depth: null });

		return { plan: res.experimental_output, usage: res.usage };
	}
}
