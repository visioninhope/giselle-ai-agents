import type { FlowTrigger } from "@giselle-sdk/data-type";
import type {
	GitHubAuthConfig,
	WebhookEvent,
	WebhookEventName,
	addReaction,
	createIssueComment,
	createPullRequestComment,
	ensureWebhookEvent,
	replyPullRequestReviewComment,
	updateIssueComment,
	updatePullRequestReviewComment,
} from "@giselle-sdk/github-tool";
import { buildWorkflowFromNode } from "@giselle-sdk/workflow-utils";
import type { runFlow } from "../flows";
import type { GiselleEngineContext } from "../types";
import { getWorkspace } from "../workspaces/utils";
import type { parseCommand } from "./utils";

function buildProgressTable(
	jobs: { operations: { node: { id: string; name?: string } }[] }[],
	index: number,
) {
	const header = "| Step | Nodes | Status |";
	const separator = "| --- | --- | --- |";
	const rows = jobs.map((job, i) => {
		const names = job.operations
			.map((op) => op.node.name ?? op.node.id)
			.join(", ");
		const status = i < index ? "✅" : i === index ? "⏳" : "";
		return `| ${i + 1} | ${names} | ${status} |`;
	});
	return [header, separator, ...rows].join("\n");
}

export interface EventHandlerDependencies {
	addReaction: typeof addReaction;
	ensureWebhookEvent: typeof ensureWebhookEvent;
	runFlow: typeof runFlow;
	parseCommand: typeof parseCommand;
	createIssueComment: typeof createIssueComment;
	createPullRequestComment: typeof createPullRequestComment;
	replyPullRequestReviewComment: typeof replyPullRequestReviewComment;
	updateIssueComment: typeof updateIssueComment;
	updatePullRequestReviewComment: typeof updatePullRequestReviewComment;
}

export type EventHandlerArgs<TEventName extends WebhookEventName> = {
	event: WebhookEvent<TEventName>;
	context: GiselleEngineContext;
	trigger: FlowTrigger;
	authConfig: GitHubAuthConfig;
	deps: EventHandlerDependencies;
};

export type EventHandlerResult = {
	shouldRun: boolean;
	reactionNodeId?: string;
};

export function handleIssueOpened<TEventName extends WebhookEventName>(
	args: EventHandlerArgs<TEventName>,
): EventHandlerResult {
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

	return { shouldRun: true, reactionNodeId: issue.node_id };
}

export function handleIssueClosed<TEventName extends WebhookEventName>(
	args: EventHandlerArgs<TEventName>,
): EventHandlerResult {
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

	return { shouldRun: true, reactionNodeId: issue.node_id };
}

export function handleIssueCommentCreated<TEventName extends WebhookEventName>(
	args: EventHandlerArgs<TEventName>,
): EventHandlerResult {
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

	return { shouldRun: true, reactionNodeId: comment.node_id };
}

export function handlePullRequestCommentCreated<
	TEventName extends WebhookEventName,
>(args: EventHandlerArgs<TEventName>): EventHandlerResult {
	if (
		!args.deps.ensureWebhookEvent(args.event, "issue_comment.created") ||
		args.trigger.configuration.event.id !==
			"github.pull_request_comment.created"
	) {
		return { shouldRun: false };
	}
	if (args.event.data.payload.issue?.pull_request === null) {
		return { shouldRun: false };
	}

	const command = args.deps.parseCommand(args.event.data.payload.comment.body);
	const conditions =
		args.trigger.configuration.event.id ===
		"github.pull_request_comment.created"
			? args.trigger.configuration.event.conditions
			: undefined;

	if (command?.callsign !== conditions?.callsign) {
		return { shouldRun: false };
	}

	return {
		shouldRun: true,
		reactionNodeId: args.event.data.payload.comment.node_id,
	};
}

export function handlePullRequestReviewCommentCreated<
	TEventName extends WebhookEventName,
>(args: EventHandlerArgs<TEventName>): EventHandlerResult {
	if (
		!args.deps.ensureWebhookEvent(
			args.event,
			"pull_request_review_comment.created",
		) ||
		args.trigger.configuration.event.id !==
			"github.pull_request_review_comment.created"
	) {
		return { shouldRun: false };
	}

	const comment = args.event.data.payload.comment;
	if (!comment) {
		return { shouldRun: false };
	}

	const command = args.deps.parseCommand(comment.body);
	const conditions =
		args.trigger.configuration.event.id ===
		"github.pull_request_review_comment.created"
			? args.trigger.configuration.event.conditions
			: undefined;

	if (command?.callsign !== conditions?.callsign) {
		return { shouldRun: false };
	}

	return {
		shouldRun: true,
		reactionNodeId: comment.node_id,
	};
}

export function handlePullRequestOpened<TEventName extends WebhookEventName>(
	args: EventHandlerArgs<TEventName>,
): EventHandlerResult {
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

	return { shouldRun: true, reactionNodeId: pullRequest.node_id };
}

export function handlePullRequestReadyForReview<
	TEventName extends WebhookEventName,
>(args: EventHandlerArgs<TEventName>): EventHandlerResult {
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

	return { shouldRun: true, reactionNodeId: pullRequest.node_id };
}

export function handlePullRequestClosed<TEventName extends WebhookEventName>(
	args: EventHandlerArgs<TEventName>,
): EventHandlerResult {
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

	return { shouldRun: true, reactionNodeId: pullRequest.node_id };
}

export const eventHandlers = [
	handleIssueOpened,
	handleIssueClosed,
	handleIssueCommentCreated,
	handlePullRequestCommentCreated,
	handlePullRequestReviewCommentCreated,
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
		deps: EventHandlerDependencies;
	},
): Promise<boolean> {
	if (
		!args.trigger.enable ||
		args.trigger.configuration.provider !== "github"
	) {
		return false;
	}

	const installationId = args.trigger.configuration.installationId;
	const authConfig = args.createAuthConfig(installationId);

	// Merge provided dependencies with defaults
	const deps = { ...args.deps };

	for (const handler of eventHandlers) {
		const result = handler({
			...args,
			authConfig,
			deps,
		});

		if (result.reactionNodeId) {
			await deps.addReaction({
				id: result.reactionNodeId,
				content: "EYES",
				authConfig,
			});
		}

		if (result.shouldRun) {
			let flow: ReturnType<typeof buildWorkflowFromNode> | null = null;
			try {
				const workspace = await getWorkspace({
					storage: args.context.storage,
					workspaceId: args.trigger.workspaceId,
				});

				flow = buildWorkflowFromNode(
					args.trigger.nodeId,
					workspace.nodes,
					workspace.connections,
				);
			} catch {
				flow = null;
			}

			let createdComment: { id: number; type: "issue" | "review" } | undefined;

			if (flow) {
				const table = buildProgressTable(flow.jobs, -1);
				const body = `Running flow...\n\n${table}`;

				if (
					deps.ensureWebhookEvent(args.event, "issue_comment.created") &&
					args.event.data.payload.issue?.pull_request === null
				) {
					const issueNumber = args.event.data.payload.issue.number;
					const comment = await deps.createIssueComment({
						repositoryNodeId: args.trigger.configuration.repositoryNodeId,
						issueNumber,
						body,
						authConfig,
					});
					createdComment = { id: comment.id, type: "issue" };
				} else if (
					deps.ensureWebhookEvent(args.event, "issue_comment.created")
				) {
					const pullNumber = args.event.data.payload.issue.number;
					const comment = await deps.createPullRequestComment({
						repositoryNodeId: args.trigger.configuration.repositoryNodeId,
						pullNumber,
						body,
						authConfig,
					});
					createdComment = { id: comment.id, type: "issue" };
				} else if (
					deps.ensureWebhookEvent(
						args.event,
						"pull_request_review_comment.created",
					)
				) {
					const pullNumber = args.event.data.payload.pull_request.number;
					const comment = await deps.replyPullRequestReviewComment({
						repositoryNodeId: args.trigger.configuration.repositoryNodeId,
						pullNumber,
						commentId: args.event.data.payload.comment.id,
						body,
						authConfig,
					});
					createdComment = { id: comment.id, type: "review" };
				} else if (
					deps.ensureWebhookEvent(args.event, "issues.opened") ||
					deps.ensureWebhookEvent(args.event, "issues.closed")
				) {
					const issueNumber = args.event.data.payload.issue.number;
					const comment = await deps.createIssueComment({
						repositoryNodeId: args.trigger.configuration.repositoryNodeId,
						issueNumber,
						body,
						authConfig,
					});
					createdComment = { id: comment.id, type: "issue" };
				} else if (
					deps.ensureWebhookEvent(args.event, "pull_request.opened") ||
					deps.ensureWebhookEvent(
						args.event,
						"pull_request.ready_for_review",
					) ||
					deps.ensureWebhookEvent(args.event, "pull_request.closed")
				) {
					const pullNumber = args.event.data.payload.pull_request.number;
					const comment = await deps.createPullRequestComment({
						repositoryNodeId: args.trigger.configuration.repositoryNodeId,
						pullNumber,
						body,
						authConfig,
					});
					createdComment = { id: comment.id, type: "issue" };
				}

				const updateComment = async (index: number) => {
					if (!createdComment) return;
					const nextBody = `Running flow...\n\n${buildProgressTable(
						flow.jobs,
						index,
					)}`;
					if (createdComment.type === "issue") {
						await deps.updateIssueComment({
							repositoryNodeId: args.trigger.configuration.repositoryNodeId,
							commentId: createdComment.id,
							body: nextBody,
							authConfig,
						});
					} else {
						await deps.updatePullRequestReviewComment({
							repositoryNodeId: args.trigger.configuration.repositoryNodeId,
							commentId: createdComment.id,
							body: nextBody,
							authConfig,
						});
					}
				};

				await deps.runFlow({
					context: args.context,
					triggerId: args.trigger.id,
					triggerInputs: [
						{
							type: "github-webhook-event",
							webhookEvent: args.event,
						},
					],
					onStep: async ({ stepIndex }) => {
						await updateComment(stepIndex);
					},
				});
			} else {
				await deps.runFlow({
					context: args.context,
					triggerId: args.trigger.id,
					triggerInputs: [
						{
							type: "github-webhook-event",
							webhookEvent: args.event,
						},
					],
				});
			}
			return true;
		}
	}

	return false;
}
