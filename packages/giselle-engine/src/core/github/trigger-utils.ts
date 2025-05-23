import type {
	FlowTrigger,
	GenerationContextInput,
	ParameterItem,
} from "@giselle-sdk/data-type";
import type { githubTriggers } from "@giselle-sdk/flow";
import {
	type WebhookEvent,
	ensureWebhookEvent,
	isWebhookEvent,
} from "@giselle-sdk/github-tool";
import { type GitHubEvent, GitHubEventType } from "./events";
import { parseCommand } from "./utils";

interface BuildTriggerInputsArgs {
	githubTrigger: (typeof githubTriggers)[keyof typeof githubTriggers];
	trigger: FlowTrigger;
	webhookEvent: WebhookEvent;
}
export function buildTriggerInputs(
	args: BuildTriggerInputsArgs,
): GenerationContextInput | null {
	const items = [
		...buildIssueCreatedInputs(args),
		...buildIssueClosedInputs(args),
		...buildIssueCommentInputs(args),
		...buildPullRequestOpenedInputs(args),
		...buildPullRequestReadyForReviewInputs(args),
		...buildPullRequestClosedInputs(args),
		...buildPullRequestCommentInputs(args),
	];

	return items.length > 0
		? {
				type: "parameters",
				items,
			}
		: null;
}

function buildIssueCreatedInputs(
	args: BuildTriggerInputsArgs,
): ParameterItem[] {
	if (
		!ensureWebhookEvent(args.webhookEvent, "issues.opened") ||
		args.githubTrigger.event.id !== "github.issue.created"
	) {
		return [];
	}
	const items: ParameterItem[] = [];
	for (const payload of args.githubTrigger.event.payloads.keyof().options) {
		switch (payload) {
			case "title":
				items.push({
					name: "title",
					type: "string",
					value: args.webhookEvent.data.payload.issue.title,
				});
				break;
			case "body":
				items.push({
					name: "body",
					type: "string",
					value: args.webhookEvent.data.payload.issue.body ?? "",
				});
				break;
			case "issueNumber":
				items.push({
					name: "issueNumber",
					type: "string",
					value: args.webhookEvent.data.payload.issue.number.toString(),
				});
				break;
			default: {
				const _exhaustiveCheck: never = payload;
				throw new Error(`Unhandled payload id: ${_exhaustiveCheck}`);
			}
		}
	}
	return items;
}

function buildIssueClosedInputs(args: BuildTriggerInputsArgs): ParameterItem[] {
	if (
		!ensureWebhookEvent(args.webhookEvent, "issues.closed") ||
		args.githubTrigger.event.id !== "github.issue.closed"
	) {
		return [];
	}

	const items: ParameterItem[] = [];
	for (const payload of args.githubTrigger.event.payloads.keyof().options) {
		switch (payload) {
			case "title":
				items.push({
					name: "title",
					type: "string",
					value: args.webhookEvent.data.payload.issue.title,
				});
				break;
			case "body":
				items.push({
					name: "body",
					type: "string",
					value: args.webhookEvent.data.payload.issue.body ?? "",
				});
				break;
			case "issueNumber":
				items.push({
					name: "issueNumber",
					type: "string",
					value: args.webhookEvent.data.payload.issue.number.toString(),
				});
				break;
			default: {
				const _exhaustiveCheck: never = payload;
				throw new Error(`Unhandled payload id: ${_exhaustiveCheck}`);
			}
		}
	}
	return items;
}

function buildIssueCommentInputs(
	args: BuildTriggerInputsArgs,
): ParameterItem[] {
	if (
		!ensureWebhookEvent(args.webhookEvent, "issue_comment.created") ||
		args.trigger.configuration.event.id !== "github.issue_comment.created" ||
		args.githubTrigger.event.id !== "github.issue_comment.created"
	) {
		return [];
	}

	const command = parseCommand(args.webhookEvent.data.payload.comment.body);
	if (
		command === null ||
		command.callsign !== args.trigger.configuration.event.conditions.callsign
	) {
		return [];
	}

	const items: ParameterItem[] = [];
	for (const payload of args.githubTrigger.event.payloads.keyof().options) {
		switch (payload) {
			case "body":
				items.push({
					name: "body",
					type: "string",
					value: command.content,
				});
				break;
			case "issueBody":
				items.push({
					name: "issueBody",
					type: "string",
					value: args.webhookEvent.data.payload.issue.body ?? "",
				});
				break;
			case "issueNumber":
				items.push({
					name: "issueNumber",
					type: "string",
					value: args.webhookEvent.data.payload.issue.number.toString(),
				});
				break;
			case "issueTitle":
				items.push({
					name: "issueTitle",
					type: "string",
					value: args.webhookEvent.data.payload.issue.title,
				});
				break;
			default: {
				const _exhaustiveCheck: never = payload;
				throw new Error(`Unhandled payload id: ${_exhaustiveCheck}`);
			}
		}
	}
	return items;
}

function buildPullRequestOpenedInputs(
	args: BuildTriggerInputsArgs,
): ParameterItem[] {
	if (
		!ensureWebhookEvent(args.webhookEvent, "pull_request.opened") ||
		args.githubTrigger.event.id !== "github.pull_request.opened"
	) {
		return [];
	}

	const items: ParameterItem[] = [];
	for (const payload of args.githubTrigger.event.payloads.keyof().options) {
		switch (payload) {
			case "title":
				items.push({
					name: "title",
					type: "string",
					value: args.webhookEvent.data.payload.pull_request.title,
				});
				break;
			case "body":
				items.push({
					name: "body",
					type: "string",
					value: args.webhookEvent.data.payload.pull_request.body ?? "",
				});
				break;
			case "number":
				items.push({
					name: "number",
					type: "string",
					value: args.webhookEvent.data.payload.pull_request.number.toString(),
				});
				break;
			case "pullRequestUrl":
				items.push({
					name: "pullRequestUrl",
					type: "string",
					value: args.webhookEvent.data.payload.pull_request.html_url,
				});
				break;
			default: {
				const _exhaustiveCheck: never = payload;
				throw new Error(`Unhandled payload id: ${_exhaustiveCheck}`);
			}
		}
	}
	return items;
}

function buildPullRequestReadyForReviewInputs(
	args: BuildTriggerInputsArgs,
): ParameterItem[] {
	if (
		!ensureWebhookEvent(args.webhookEvent, "pull_request.ready_for_review") ||
		args.githubTrigger.event.id !== "github.pull_request.ready_for_review"
	) {
		return [];
	}

	const items: ParameterItem[] = [];
	for (const payload of args.githubTrigger.event.payloads.keyof().options) {
		switch (payload) {
			case "title":
				items.push({
					name: "title",
					type: "string",
					value: args.webhookEvent.data.payload.pull_request.title,
				});
				break;
			case "body":
				items.push({
					name: "body",
					type: "string",
					value: args.webhookEvent.data.payload.pull_request.body ?? "",
				});
				break;
			case "number":
				items.push({
					name: "number",
					type: "string",
					value: args.webhookEvent.data.payload.pull_request.number.toString(),
				});
				break;
			case "pullRequestUrl":
				items.push({
					name: "pullRequestUrl",
					type: "string",
					value: args.webhookEvent.data.payload.pull_request.html_url,
				});
				break;
			default: {
				const _exhaustiveCheck: never = payload;
				throw new Error(`Unhandled payload id: ${_exhaustiveCheck}`);
			}
		}
	}
	return items;
}

function buildPullRequestClosedInputs(
	args: BuildTriggerInputsArgs,
): ParameterItem[] {
	if (
		!ensureWebhookEvent(args.webhookEvent, "pull_request.closed") ||
		args.githubTrigger.event.id !== "github.pull_request.closed"
	) {
		return [];
	}

	const items: ParameterItem[] = [];
	for (const payload of args.githubTrigger.event.payloads.keyof().options) {
		switch (payload) {
			case "title":
				items.push({
					name: "title",
					type: "string",
					value: args.webhookEvent.data.payload.pull_request.title,
				});
				break;
			case "body":
				items.push({
					name: "body",
					type: "string",
					value: args.webhookEvent.data.payload.pull_request.body ?? "",
				});
				break;
			case "number":
				items.push({
					name: "number",
					type: "string",
					value: args.webhookEvent.data.payload.pull_request.number.toString(),
				});
				break;
			case "pullRequestUrl":
				items.push({
					name: "pullRequestUrl",
					type: "string",
					value: args.webhookEvent.data.payload.pull_request.html_url,
				});
				break;
			default: {
				const _exhaustiveCheck: never = payload;
				throw new Error(`Unhandled payload id: ${_exhaustiveCheck}`);
			}
		}
	}
	return items;
}

function buildPullRequestCommentInputs(
	args: BuildTriggerInputsArgs,
): ParameterItem[] {
	if (
		!ensureWebhookEvent(args.webhookEvent, "issue_comment.created") ||
		args.trigger.configuration.event.id !==
			"github.pull_request_comment.created" ||
		args.githubTrigger.event.id !== "github.pull_request_comment.created"
	) {
		return [];
	}

	if (args.webhookEvent.data.payload.issue?.pull_request === null) {
		return [];
	}

	const command = parseCommand(args.webhookEvent.data.payload.comment.body);
	if (
		command === null ||
		command.callsign !== args.trigger.configuration.event.conditions.callsign
	) {
		return [];
	}

	const items: ParameterItem[] = [];
	for (const payload of args.githubTrigger.event.payloads.keyof().options) {
		switch (payload) {
			case "body":
				items.push({
					name: "body",
					type: "string",
					value: command.content,
				});
				break;
			case "issueBody":
				items.push({
					name: "issueBody",
					type: "string",
					value: args.webhookEvent.data.payload.issue.body ?? "",
				});
				break;
			case "issueNumber":
				items.push({
					name: "issueNumber",
					type: "string",
					value: args.webhookEvent.data.payload.issue.number.toString(),
				});
				break;
			case "issueTitle":
				items.push({
					name: "issueTitle",
					type: "string",
					value: args.webhookEvent.data.payload.issue.title,
				});
				break;
			default: {
				const _exhaustiveCheck: never = payload;
				throw new Error(`Unhandled payload id: ${_exhaustiveCheck}`);
			}
		}
	}
	return items;
}
