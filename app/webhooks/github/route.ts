import type { GenerateResult } from "@/app/(playground)/p/[agentId]/beta-proto/flow/types";
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
import {
	buildTextArtifact,
	generateArtifactObject,
} from "../../(playground)/p/[agentId]/beta-proto/flow/server-actions/generate-text";
import {
	buildWebSearchArtifact,
	generateWebSearchArtifactObject,
} from "../../(playground)/p/[agentId]/beta-proto/flow/server-actions/websearch";
import {
	buildFlow,
	buildGenerateResult,
	buildGeneratorNode,
} from "../../(playground)/p/[agentId]/beta-proto/flow/utils";
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
		where: (gitHubIntegrations, { eq, and }) =>
			and(
				eq(gitHubIntegrations.repositoryFullName, repositoryFullName),
				eq(gitHubIntegrations.callSign, callSign),
			),
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
			const flow = await buildFlow({
				input: {
					agentId: agent.id,
					finalNodeId: integration.endNodeId,
					graph: agent.graphv2,
				},
			});

			const generateResults: GenerateResult[] = [];
			for (const job of flow.jobs) {
				await Promise.all(
					job.steps.map(async (step) => {
						const relevanceResults = step.sourceNodeIds
							.map((sourceNodeId) => {
								const sourceArtifact = generateResults.find(
									(generateResult) =>
										generateResult.generator.nodeId === sourceNodeId,
								);
								/** @todo log warning */
								if (sourceArtifact === undefined) {
									return null;
								}
								return sourceArtifact;
							})
							.filter((sourceArtifact) => sourceArtifact !== null);
						switch (step.action) {
							case "generate-text": {
								const prompt =
									integration.startNodeId === step.node.id
										? command.content
										: step.prompt;
								const artifactObject = await generateArtifactObject({
									input: {
										prompt,
										model: step.modelConfiguration,
										sources: [
											...step.sources,
											...relevanceResults.map((result) => result.artifact),
										],
									},
								});
								generateResults.push(
									buildGenerateResult({
										generator: buildGeneratorNode({
											nodeId: step.node.id,
											archetype: step.node.archetype,
											name: step.node.name,
										}),
										artifact: buildTextArtifact({
											title: artifactObject.artifact.title,
											content: artifactObject.artifact.content,
										}),
									}),
								);
								break;
							}
							case "search-web": {
								const webSearchArtifact = await generateWebSearchArtifactObject(
									{
										input: {
											prompt: step.prompt,
											sources: [
												...step.sources,
												...relevanceResults.map((result) => result.artifact),
											],
										},
									},
								);
								generateResults.push(
									buildGenerateResult({
										generator: buildGeneratorNode({
											nodeId: step.node.id,
											archetype: step.node.archetype,
											name: step.node.name,
										}),
										artifact: buildWebSearchArtifact({
											keywords: webSearchArtifact.keywords,
											scrapingTasks: webSearchArtifact.scrapingTasks,
										}),
									}),
								);
								break;
							}
						}
					}),
				);
			}

			const output = generateResults.find(
				(generateResult) =>
					generateResult.generator.nodeId === integration.endNodeId,
			);
			if (
				output === undefined ||
				output.artifact.object === "artifact.webSearch"
			) {
				/** @todo log */
				return;
			}

			if (integration.nextAction === "github.issue_comment.reply") {
				const commentBody = output.artifact.content;

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
