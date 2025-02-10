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
			endpoint: z
				.string()
				.describe(
					"The GitHub API endpoint to call (e.g., 'GET /repos/{owner}/{repo}/pulls/{pull_number}')",
				),
			args: z
				.record(z.unknown())
				.describe("The arguments to pass to the API call"),
		}),
	),
	summary: z
		.string()
		.describe("A brief summary of what these API calls will accomplish"),
});

export type GitHubApiPlan = z.infer<typeof githubApiPlanSchema>;

export class GitHubPlanner {
	private readonly MAX_STEPS = 3;
	private readonly model: LanguageModelV1;

	constructor(model: LanguageModelV1) {
		this.model = model;
	}

	public async plan(
		instruction: string,
	): Promise<{ plan: GitHubApiPlan; usage: LanguageModelUsage }> {
		const res = await generateText({
			model: this.model,
			maxSteps: this.MAX_STEPS,
			experimental_output: Output.object({
				schema: githubApiPlanSchema,
			}),
			temperature: 0,
			system: `You are a GitHub API planner focused on creating plans for retrieving data through the GitHub API.

Primary Goals:
- Plan GitHub API requests based on user instructions
- Return a structured plan with exact API endpoints and arguments
- Break down complex tasks into multiple API calls when necessary
- Never include mutations or repository modifications in your plans

Guidelines:
1. Always use official GitHub API endpoints
2. Include all necessary parameters in the args object
3. Break down complex tasks into multiple API calls
4. Consider rate limits and data size when planning
5. Provide clear summaries of what each API call will accomplish

Example plan for "Get information about a pull request":
{
  "plans": [
    {
      "endpoint": "GET /repos/{owner}/{repo}/pulls/{pull_number}",
      "args": {
        "owner": "octocat",
        "repo": "hello-world",
        "pull_number": 1
      }
    }
  ],
  "summary": "Retrieve basic information about pull request #1"
}`,
			prompt: instruction,
		});

		console.log("plan =================");
		console.dir(res.experimental_output, { depth: null });

		return { plan: res.experimental_output, usage: res.usage };
	}
}
