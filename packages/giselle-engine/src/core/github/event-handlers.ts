import {
	type GitHubAuthConfig,
	type WebhookEvent,
	type WebhookEventName,
	addReaction as addReactionDefault,
	ensureWebhookEvent as ensureWebhookEventDefault,
} from "@giselle-sdk/github-tool";
import { runFlow as runFlowDefault } from "../flows";
import type { GiselleEngineContext } from "../types";
import { parseCommand as parseCommandDefault } from "./utils";

export interface Dependencies {
	addReaction: typeof addReactionDefault;
	ensureWebhookEvent: typeof ensureWebhookEventDefault;
	runFlow: typeof runFlowDefault;
	parseCommand: typeof parseCommandDefault;
}

// Default implementation of dependencies
export const defaultDeps: Dependencies = {
	addReaction: addReactionDefault,
	ensureWebhookEvent: ensureWebhookEventDefault,
	runFlow: runFlowDefault,
	parseCommand: parseCommandDefault,
};
import type { FlowTrigger } from "@giselle-sdk/data-type";

export interface EventPayload {
	installation: { id: number };
	repository: { node_id: string };
	issue?: { node_id: string; pull_request?: object | null };
	comment?: { node_id: string; body: string };
	pull_request?: { node_id: string };
}

export type EventHandlerArgs<TEventName extends WebhookEventName> = {
	event: WebhookEvent<TEventName> & { data: { payload: EventPayload } };
	context: GiselleEngineContext;
	trigger: FlowTrigger;
	authConfig: GitHubAuthConfig;
	deps: Dependencies;
};

export type EventHandlerResult = {
	shouldRun: boolean;
};

export async function handleIssueOpened<TEventName extends WebhookEventName>(
	args: EventHandlerArgs<TEventName>,
): Promise<EventHandlerResult> {
	if (
		!args.deps.ensureWebhookEvent(args.event, "issues.opened") ||
		args.trigger.configuration.event.id !== "github.issue.created"
	) {
		return { shouldRun: false };
	}

	const issue = args.event.data.payload.issue;
	if (!issue) {
		return { shouldRun: false };
	}

	await args.deps.addReaction({
		id: issue.node_id,
		content: "EYES",
		authConfig: args.authConfig,
	});

	return { shouldRun: true };
}

export async function handleIssueClosed<TEventName extends WebhookEventName>(
	args: EventHandlerArgs<TEventName>,
): Promise<EventHandlerResult> {
	if (
		!args.deps.ensureWebhookEvent(args.event, "issues.closed") ||
		args.trigger.configuration.event.id !== "github.issue.closed"
	) {
		return { shouldRun: false };
	}

	const issue = args.event.data.payload.issue;
	if (!issue) {
		return { shouldRun: false };
	}

	await args.deps.addReaction({
		id: issue.node_id,
		content: "EYES",
		authConfig: args.authConfig,
	});

	return { shouldRun: true };
}

export async function handleIssueCommentCreated<
	TEventName extends WebhookEventName,
>(args: EventHandlerArgs<TEventName>): Promise<EventHandlerResult> {
	if (
		!args.deps.ensureWebhookEvent(args.event, "issue_comment.created") ||
		args.trigger.configuration.event.id !== "github.issue_comment.created"
	) {
		return { shouldRun: false };
	}

	const comment = args.event.data.payload.comment;
	if (!comment) {
		return { shouldRun: false };
	}

	const command = args.deps.parseCommand(comment.body);
	const conditions =
		args.trigger.configuration.event.id === "github.issue_comment.created"
			? args.trigger.configuration.event.conditions
			: undefined;

	if (command?.callsign !== conditions?.callsign) {
		return { shouldRun: false };
	}

	await args.deps.addReaction({
		id: comment.node_id,
		content: "EYES",
		authConfig: args.authConfig,
	});

	return { shouldRun: true };
}

export async function handlePullRequestCommentCreated<
	TEventName extends WebhookEventName,
>(args: EventHandlerArgs<TEventName>): Promise<EventHandlerResult> {
	const issue = args.event.data.payload.issue;
	const comment = args.event.data.payload.comment;

	const isPrComment =
		(args.deps.ensureWebhookEvent(args.event, "issue_comment.created") &&
			args.trigger.configuration.event.id ===
				"github.pull_request_comment.created" &&
			issue?.pull_request !== null) ||
		(args.deps.ensureWebhookEvent(
			args.event,
			"pull_request_review_comment.created",
		) &&
			args.trigger.configuration.event.id ===
				"github.pull_request_comment.created");

	if (!isPrComment || !comment) {
		return { shouldRun: false };
	}

	const command = args.deps.parseCommand(comment.body);
	const conditions =
		args.trigger.configuration.event.id ===
		"github.pull_request_comment.created"
			? args.trigger.configuration.event.conditions
			: undefined;

	if (command?.callsign !== conditions?.callsign) {
		return { shouldRun: false };
	}

	await args.deps.addReaction({
		id: comment.node_id,
		content: "EYES",
		authConfig: args.authConfig,
	});

	return { shouldRun: true };
}

export async function handlePullRequestOpened<
	TEventName extends WebhookEventName,
>(args: EventHandlerArgs<TEventName>): Promise<EventHandlerResult> {
	if (
		!args.deps.ensureWebhookEvent(args.event, "pull_request.opened") ||
		args.trigger.configuration.event.id !== "github.pull_request.opened"
	) {
		return { shouldRun: false };
	}

	const pullRequest = args.event.data.payload.pull_request;
	if (!pullRequest) {
		return { shouldRun: false };
	}

	await args.deps.addReaction({
		id: pullRequest.node_id,
		content: "EYES",
		authConfig: args.authConfig,
	});

	return { shouldRun: true };
}

export async function handlePullRequestReadyForReview<
	TEventName extends WebhookEventName,
>(args: EventHandlerArgs<TEventName>): Promise<EventHandlerResult> {
	if (
		!args.deps.ensureWebhookEvent(
			args.event,
			"pull_request.ready_for_review",
		) ||
		args.trigger.configuration.event.id !==
			"github.pull_request.ready_for_review"
	) {
		return { shouldRun: false };
	}

	const pullRequest = args.event.data.payload.pull_request;
	if (!pullRequest) {
		return { shouldRun: false };
	}

	await args.deps.addReaction({
		id: pullRequest.node_id,
		content: "EYES",
		authConfig: args.authConfig,
	});

	return { shouldRun: true };
}

export async function handlePullRequestClosed<
	TEventName extends WebhookEventName,
>(args: EventHandlerArgs<TEventName>): Promise<EventHandlerResult> {
	if (
		!args.deps.ensureWebhookEvent(args.event, "pull_request.closed") ||
		args.trigger.configuration.event.id !== "github.pull_request.closed"
	) {
		return { shouldRun: false };
	}

	const pullRequest = args.event.data.payload.pull_request;
	if (!pullRequest) {
		return { shouldRun: false };
	}

	await args.deps.addReaction({
		id: pullRequest.node_id,
		content: "EYES",
		authConfig: args.authConfig,
	});

	return { shouldRun: true };
}

export const eventHandlers = [
	handleIssueOpened,
	handleIssueClosed,
	handleIssueCommentCreated,
	handlePullRequestCommentCreated,
	handlePullRequestOpened,
	handlePullRequestReadyForReview,
	handlePullRequestClosed,
];

export async function processEvent<TEventName extends WebhookEventName>(
	args: Omit<
		EventHandlerArgs<TEventName>,
		"trigger" | "authConfig" | "deps"
	> & {
		trigger: EventHandlerArgs<TEventName>["trigger"];
		createAuthConfig: (installationId: number) => GitHubAuthConfig;
		deps?: Partial<Dependencies>;
	},
): Promise<boolean> {
	if (
		!args.trigger.enable ||
		args.trigger.configuration.provider !== "github"
	) {
		return false;
	}

	const installationId = args.event.data.payload.installation.id;
	const authConfig = args.createAuthConfig(installationId);

	// Merge provided dependencies with defaults
	const deps = { ...defaultDeps, ...args.deps };

	for (const handler of eventHandlers) {
		const result = await handler({
			...args,
			authConfig,
			deps,
		});

		if (result.shouldRun) {
			await deps.runFlow({
				context: args.context,
				triggerId: args.trigger.id,
				payload: args.event,
			});
			return true;
		}
	}

	return false;
}
