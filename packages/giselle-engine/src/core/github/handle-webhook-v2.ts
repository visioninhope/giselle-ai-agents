import {
	type GitHubAuthConfig,
	type WebhookEvent,
	type WebhookEventName,
	addReaction,
	ensureWebhookEvent,
	handleWebhook,
} from "@giselle-sdk/github-tool";
import type { Storage } from "unstorage";
import { runFlow } from "../flows";
import { getFlowTrigger } from "../flows/utils";
import { getGitHubRepositoryIntegrationIndex } from "../integrations/utils";
import type { GiselleEngineContext } from "../types";

export async function handleGitHubWebhookV2(args: {
	context: GiselleEngineContext;
	request: Request;
}) {
	const credentials = args.context.integrationConfigs?.github?.authV2;
	if (credentials === undefined) {
		throw new Error("GitHub credentials not found");
	}

	await handleWebhook({
		secret: credentials.webhookSecret,
		request: args.request,
		on: {
			"issue_comment.created": (event) =>
				process({
					event,
					context: args.context,
				}),
			"issue_comment.deleted": (event) =>
				process({
					event,
					context: args.context,
				}),
		},
	});
}

function hasRequiredPayloadProps(event: unknown): event is {
	data: {
		payload: { repository: { node_id: string }; installation: { id: number } };
	};
} {
	return (
		typeof event === "object" &&
		event !== null &&
		"data" in event &&
		event.data !== null &&
		typeof event.data === "object" &&
		"payload" in event.data &&
		event.data.payload !== null &&
		typeof event.data.payload === "object" &&
		"repository" in event.data.payload &&
		typeof event.data.payload.repository === "object" &&
		event.data.payload.repository !== null &&
		"node_id" in event.data.payload.repository &&
		typeof event.data.payload.repository.node_id === "string" &&
		"installation" in event.data.payload &&
		event.data.payload.installation !== null &&
		typeof event.data.payload.installation === "object" &&
		"id" in event.data.payload.installation
	);
}
async function process<TEventName extends WebhookEventName>(args: {
	event: WebhookEvent<TEventName>;
	context: GiselleEngineContext;
}) {
	if (!hasRequiredPayloadProps(args.event)) {
		return;
	}
	const installationId = args.event.data.payload.installation.id;
	const githubRepositoryIntegration = await getGitHubRepositoryIntegrationIndex(
		{
			storage: args.context.storage,
			repositoryNodeId: args.event.data.payload.repository.node_id,
		},
	);

	if (githubRepositoryIntegration === undefined) {
		return;
	}
	await Promise.all(
		githubRepositoryIntegration.flowTriggerIds.map(async (flowTriggerId) => {
			const trigger = await getFlowTrigger({
				storage: args.context.storage,
				flowTriggerId,
			});

			if (!trigger.enable || trigger.configuration.provider !== "github") {
				return;
			}

			const githubAuthV2 = args.context.integrationConfigs?.github?.authV2;
			if (githubAuthV2 === undefined) {
				throw new Error("GitHub authV2 configuration is missing");
			}
			const authConfig = {
				strategy: "app-installation",
				appId: githubAuthV2.appId,
				privateKey: githubAuthV2.privateKey,
				installationId,
			} satisfies GitHubAuthConfig;

			if (
				ensureWebhookEvent(args.event, "issues.opened") &&
				trigger.configuration.event.id === "github.issue.created"
			) {
				await Promise.all([
					addReaction({
						id: args.event.data.payload.issue.node_id,
						content: "EYES",
						authConfig,
					}),
					runFlow({
						context: args.context,
						triggerId: trigger.id,
						payload: args.event,
					}),
				]);
			}
		}),
	);
}
