import { type agents, db, teamMemberships, users } from "@/drizzle";
import { saveAgentActivity } from "@/services/agents/activities";
import { reportAgentTimeUsage } from "@/services/usage-based-billing";
import { executeStep } from "@giselles-ai/lib/execution";
import { performFlowExecution } from "@giselles-ai/lib/runner";
import {
	createExecutionId,
	createInitialJobExecutions,
} from "@giselles-ai/lib/utils";
import type { Execution, Graph } from "@giselles-ai/types";
import type { Octokit } from "@octokit/core";
import { waitUntil } from "@vercel/functions";
import { eq } from "drizzle-orm";
import { parseCommand } from "./command";
import { assertIssueCommentEvent, createOctokit } from "./utils";

export class WebhookPayloadError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "PayloadError";
		Object.setPrototypeOf(this, WebhookPayloadError.prototype);
	}
}

interface GitHubClientFactory {
	createClient(installationId: number): Promise<Octokit>;
}

export const defaultGitHubClientFactory: GitHubClientFactory = {
	createClient: async (installationId: number) => {
		return await createOctokit(installationId);
	},
};

export const mockGitHubClientFactory: GitHubClientFactory = {
	createClient: async (installationId: number) =>
		({
			// biome-ignore lint/suspicious/noExplicitAny: mock
			request: async (route: string, params?: any) => {
				console.log("Mock GitHub API call:", { route, params });
				return {
					data: {
						id: "mock-comment-id",
						body: params?.body,
					},
				};
			},
		}) as Octokit,
};

/**
 * Handle GitHub webhook event
 * ref: https://docs.github.com/en/webhooks/webhook-events-and-payloads
 * currently only supports issue_comment
 * @param event
 * @returns
 */
export async function handleEvent(
	event: { id: string; name: string; payload: unknown },
	options?: { githubClientFactory?: GitHubClientFactory },
): Promise<void> {
	const githubClientFactory =
		options?.githubClientFactory ?? defaultGitHubClientFactory;
	assertIssueCommentEvent(event);
	const payload = event.payload;

	const command = parseCommand(payload.comment.body);
	if (command === null) {
		throw new WebhookPayloadError(
			`Command not found. payload: ${JSON.stringify(payload)}`,
		);
	}
	if (payload.installation === undefined) {
		throw new WebhookPayloadError(
			`Installation not found. payload: ${JSON.stringify(payload)}`,
		);
	}
	const octokit = await githubClientFactory.createClient(
		payload.installation.id,
	);

	const integrationSettings = await db.query.githubIntegrationSettings.findMany(
		{
			where: (gitHubIntegrationSettings, { eq, and }) =>
				and(
					eq(
						gitHubIntegrationSettings.repositoryFullName,
						payload.repository.full_name,
					),
					eq(gitHubIntegrationSettings.callSign, command.callSign),
				),
		},
	);

	waitUntil(
		Promise.all(
			integrationSettings.map(async (integrationSetting) => {
				const agent = await db.query.agents.findFirst({
					where: (agents, { eq }) =>
						eq(agents.dbId, integrationSetting.agentDbId),
				});
				if (agent === undefined || agent.graphUrl === null) {
					return;
				}
				const graph = await fetch(agent.graphUrl).then(
					(res) => res.json() as unknown as Graph,
				);
				const flow = graph.flows.find(
					(flow) => flow.id === integrationSetting.flowId,
				);
				if (flow === undefined) {
					console.warn(
						`GitHubIntegrationSetting: ${integrationSetting.id}, flow not found`,
					);
					return;
				}
				const executionId = createExecutionId();
				const jobExecutions = createInitialJobExecutions(flow);
				const flowRunStartedAt = Date.now();

				let initialExecution: Execution = {
					id: executionId,
					status: "running",
					flowId: flow.id,
					jobExecutions,
					artifacts: [],
					runStartedAt: flowRunStartedAt,
				};

				const overrideData = integrationSetting.eventNodeMappings
					.map((eventNodeMapping) => {
						switch (eventNodeMapping.event) {
							case "comment.body":
								return {
									nodeId: eventNodeMapping.nodeId,
									data: command.content,
								};
							case "issue.title":
								return {
									nodeId: eventNodeMapping.nodeId,
									data: payload.issue.title,
								};
							default:
								return null;
						}
					})
					.filter((overrideData) => overrideData !== null);
				const finalExecution = await performFlowExecution({
					initialExecution,
					executeStepFn: (stepId) =>
						executeStep({
							agentId: agent.id,
							flowId: flow.id,
							executionId: executionId,
							stepId: stepId,
							artifacts: initialExecution.artifacts,
							overrideData,
						}),
					onExecutionChange: (execution) => {
						initialExecution = execution;
					},
					onFinish: async ({ endedAt, durationMs, execution }) => {
						const startedAtDate = new Date(execution.runStartedAt);
						const endedAtDate = new Date(endedAt);
						await saveAgentActivity(
							agent.id,
							startedAtDate,
							endedAtDate,
							durationMs,
						);
						await reportAgentTimeUsage(endedAtDate);
					},
					onStepFail: async (stepExecution) => {
						console.error(stepExecution.error);
						await notifyWorkflowError(agent, stepExecution.error);
					},
				});

				await octokit.request(
					"POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
					{
						owner: payload.repository.owner.login,
						repo: payload.repository.name,
						issue_number: payload.issue.number,
						body: finalExecution.artifacts[finalExecution.artifacts.length - 1]
							.object.content,
					},
				);
			}),
		),
	);
}

// Notify workflow error to team members
async function notifyWorkflowError(
	agent: typeof agents.$inferSelect,
	error: string,
) {
	const teamMembers = await db
		.select({ userDisplayName: users.displayName, userEmail: users.email })
		.from(teamMemberships)
		.innerJoin(users, eq(teamMemberships.userDbId, users.dbId))
		.where(eq(teamMemberships.teamDbId, agent.teamDbId));
	for (const user of teamMembers) {
		console.dir(user);
	}

	const subject = "[Giselle] Workflow failure";
	const body = `
		Workflow failed with error: ${error}
	`;
	const recipients = teamMembers.map(
		(user) => `${user.userDisplayName} <${user.userEmail}>`,
	);

	// TODO: send email to teamMembers
	await sendEmail(subject, body, recipients);
}

async function sendEmail(subject: string, body: string, recipients: string[]) {
	console.log(
		`[sendEmail] subject: ${subject}, body: ${body}, recipients: ${recipients}`,
	);
}
