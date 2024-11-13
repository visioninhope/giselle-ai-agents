import { db, gitHubIntegrations } from "@/drizzle";
import {
	buildAppInstallationClient,
	needsAdditionalPermissions,
	webhooks,
} from "@/services/external/github";
import type { EmitterWebhookEvent } from "@octokit/webhooks";
import type { WebhookEventName } from "@octokit/webhooks-types";
import { captureException } from "@sentry/nextjs";
import type { NextRequest } from "next/server";
import { buildFlow } from "../../(playground)/p/[agentId]/beta-proto/flow/utils";
import { parseCommand } from "./command";

function setupHandlers() {
	webhooks.on("issue_comment", issueCommentHandler);
}

setupHandlers();

export async function POST(request: NextRequest) {
	const { id, name, signature, body } = await parseWebhookRequest(request);

	const verifyOK = await webhooks.verify(body, signature);
	if (!verifyOK) {
		return new Response("Failed to verify webhook", { status: 400 });
	}

	try {
		const payload = JSON.parse(body);
		await webhooks.receive({ id, name, payload } as EmitterWebhookEvent);
		return new Response("OK");
	} catch (error) {
		if (requireAdditionalPermission(error)) {
			// TODO: notify the user that additional permissions are required
			throw new Error("Additional permissions required");
		}

		// TODO: consider filtering out expected errors
		captureException(error);
		return new Response("Failed to receive webhook", {
			status: 400,
		});
	}
}

async function parseWebhookRequest(request: NextRequest) {
	const id = request.headers.get("X-GitHub-Delivery") ?? "";
	const name = request.headers.get("X-GitHub-Event") as WebhookEventName;
	const signature = request.headers.get("X-Hub-Signature-256") ?? "";
	const body = await request.text();
	return { id, name, signature, body };
}

function requireAdditionalPermission(error: unknown) {
	if (error instanceof AggregateError) {
		for (const e of error.errors) {
			if (
				needsAdditionalPermissions(e) ||
				needsAdditionalPermissions(error.cause)
			) {
				return true;
			}
		}
	}
	return needsAdditionalPermissions(error);
}

async function retrieveIntegrations(
	repositoryFullName: string,
	callSign: string,
) {
	return await db.query.gitHubIntegrations.findMany({
		where: (gitHubIntegrations, { eq }) =>
			eq(gitHubIntegrations.respositoryFullName, repositoryFullName),
	});
}

async function issueCommentHandler(
	event: EmitterWebhookEvent<"issue_comment">,
) {
	const payload = event.payload;

	const issueNumber = payload.issue.number;
	const repoName = payload.repository.name;
	const repoOwner = payload.repository.owner.login;
	const repositoryFullName = payload.repository.full_name;
	const command = parseCommand(payload.comment.body);
	if (command === null) {
		return;
	}
	const integrations = await retrieveIntegrations(
		repositoryFullName,
		command.callSign,
	);
	await Promise.all(
		integrations.map(async (integration) => {
			const agent = await db.query.agents.findFirst({
				where: (agents, { eq }) => eq(agents.dbId, integration.agentDbId),
			});
			if (agent === undefined) {
				return;
			}
			// buildFlow({
			// 	input: {
			// 		agentId: agent.id,

			// 		graph: agent.graphv2,
			// 	},
			// });

			if (integration.nextAction === "github.issue_comment.reply") {
				const commentBody = `Hello from the GitHub App! @${payload.issue.user?.login} you have triggered the action with call sign ${command.callSign}!`;

				const installation = payload.installation;
				if (!installation) {
					throw new Error("No installation found in payload");
				}
				const octokit = await buildAppInstallationClient(installation.id);

				await octokit.request(
					"POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
					{
						owner: repoOwner,
						repo: repoName,
						issue_number: issueNumber,
						body: commentBody,
					},
				);
			}
		}),
	);
}
