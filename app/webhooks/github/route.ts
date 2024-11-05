import { buildAppInstallationClient } from "@/services/external/github/app";
import { webhooks } from "@/services/external/github/webhook";
import type { EmitterWebhookEvent } from "@octokit/webhooks";
import type { WebhookEventName } from "@octokit/webhooks-types";
import type { NextRequest } from "next/server";

function setupHandlers() {
	webhooks.on("issues", issuesHandler);
}

setupHandlers();

export async function POST(request: NextRequest) {
	const body = await request.text();

	try {
		await webhooks.verifyAndReceive({
			id: request.headers.get("X-GitHub-Delivery") ?? "",
			name: request.headers.get("X-GitHub-Event") as WebhookEventName,
			signature: request.headers.get("X-Hub-Signature-256") ?? "",
			payload: body,
		});
	} catch (error) {
		console.error(error);
		return new Response("Failed to verify and receive webhook", {
			status: 400,
		});
	}

	return new Response("OK");
}

async function issuesHandler(event: EmitterWebhookEvent<"issues">) {
	const payload = event.payload;

	const issueNumber = payload.issue.number;
	const repoName = payload.repository.name;
	const repoOwner = payload.repository.owner.login;
	const commentBody = `Hello from the GitHub App! @${payload.issue.user?.login}`;

	const installation = payload.installation;
	if (!installation) {
		throw new Error("No installation found in payload");
	}
	const octokit = await buildAppInstallationClient(installation.id);

	try {
		await octokit.request(
			"POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
			{
				owner: repoOwner,
				repo: repoName,
				issue_number: issueNumber,
				body: commentBody,
			},
		);
	} catch (error) {
		throw new Error(
			`Failed to add comment to issue ${repoOwner}/${repoName}#${issueNumber}:`,
			{
				cause: error,
			},
		);
	}
}
