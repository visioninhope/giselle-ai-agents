import { db } from "@/drizzle";
import { Webhooks } from "@octokit/webhooks";
import type { WebhookEventName } from "@octokit/webhooks-types";
import { waitUntil } from "@vercel/functions";
import type { NextRequest } from "next/server";
import { parseCommand } from "./command";
import { assertIssueCommentEvent, createOctokit } from "./utils";

export async function POST(request: NextRequest) {
	if (process.env.GITHUB_APP_WEBHOOK_SECRET === undefined) {
		throw new Error("GITHUB_APP_WEBHOOK_SECRET is not set");
	}
	const webhooks = new Webhooks({
		secret: process.env.GITHUB_APP_WEBHOOK_SECRET,
	});

	const signature = request.headers.get("X-Hub-Signature-256") ?? "";
	const body = await request.text();
	const verifyOK = await webhooks.verify(body, signature);
	if (!verifyOK) {
		return new Response("Failed to verify webhook", { status: 400 });
	}

	const id = request.headers.get("X-GitHub-Delivery") ?? "";
	const name = request.headers.get("X-GitHub-Event") as WebhookEventName;
	const payload = JSON.parse(body);
	const event = { id, name, payload };
	assertIssueCommentEvent(event);

	const command = parseCommand(payload.comment.body);
	if (command === null) {
		return;
	}
	if (payload.installation === undefined) {
		return;
	}
	const octokit = await createOctokit(payload.installation.id);

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
				if (agent === undefined) {
					return;
				}
				await octokit.request(
					"POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
					{
						owner: payload.repository.owner.login,
						repo: payload.repository.name,
						issue_number: payload.issue.number,
						body: `hello! this is a test from ${agent.name}`,
					},
				);
			}),
		),
	);

	return new Response("Accepted", { status: 202 });
}
