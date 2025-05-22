import type { FlowTrigger, GenerationInput } from "@giselle-sdk/data-type";
import type { githubTriggers } from "@giselle-sdk/flow";
import {
	type WebhookEvent,
	ensureWebhookEvent,
	isWebhookEvent,
} from "@giselle-sdk/github-tool";
import { type GitHubEvent, GitHubEventType } from "./events";
import { parseCommand } from "./utils";

export function parseCommandFromEvent(
	event: GitHubEvent,
): { callsign: string; content: string } | null {
	if (event.type !== GitHubEventType.ISSUE_COMMENT_CREATED) {
		return null;
	}
	return parseCommand(event.payload.comment.body);
}

interface BuildTriggerInputsArgs {
	githubTrigger: (typeof githubTriggers)[keyof typeof githubTriggers];
	trigger: FlowTrigger;
	webhookEvent: WebhookEvent;
}
export function buildTriggerInputs(
	args: BuildTriggerInputsArgs,
): GenerationInput[] | null {
	return [...buildIssueCreatedInputs(args)];
	// if (
	// 	ensureWebhookEvent(args.webhookEvent, "issues.opened") &&
	// 	args.githubTrigger.event.id === "github.issue.created"
	// ) {
	// 	return buildIssueCreatedInputs(
	// 		,
	// 		args.githubTrigger.event.payloads.keyof().options,
	// 	);
	// }
	// switch (githubTrigger.event.id) {
	// 	case "github.issue.created":
	// 	case "github.issue.closed":
	// 		return buildIssueClosedInputs(
	// 			githubEvent,
	// 			githubTrigger.event.payloads.keyof().options,
	// 		);
	// 	case "github.issue_comment.created":
	// 		if (trigger.configuration.event.id !== "github.issue_comment.created") {
	// 			return null;
	// 		}
	// 		return buildIssueCommentInputs(
	// 			githubEvent,
	// 			githubTrigger.event.payloads.keyof().options,
	// 			trigger.configuration.event.conditions.callsign,
	// 		);
	// 	case "github.pull_request_comment.created":
	// 		if (
	// 			trigger.configuration.event.id !== "github.pull_request_comment.created"
	// 		) {
	// 			return null;
	// 		}
	// 		return buildIssueCommentInputs(
	// 			githubEvent,
	// 			githubTrigger.event.payloads.keyof().options,
	// 			trigger.configuration.event.conditions.callsign,
	// 		);
	// 	case "github.pull_request.opened": {
	// 		if (githubEvent.type !== GitHubEventType.PULL_REQUEST_OPENED) {
	// 			return null;
	// 		}
	// 		const triggerInputs: GenerationInput[] = [];
	// 		for (const payload of githubTrigger.event.payloads.keyof().options) {
	// 			switch (payload) {
	// 				case "title":
	// 					triggerInputs.push({
	// 						name: "title",
	// 						value: githubEvent.payload.pull_request.title,
	// 					});
	// 					break;
	// 				case "body":
	// 					triggerInputs.push({
	// 						name: "body",
	// 						value: githubEvent.payload.pull_request.body ?? "",
	// 					});
	// 					break;
	// 				case "number":
	// 					triggerInputs.push({
	// 						name: "number",
	// 						value: githubEvent.payload.pull_request.number.toString(),
	// 					});
	// 					break;
	// 				case "pullRequestUrl":
	// 					triggerInputs.push({
	// 						name: "pullRequesturl",
	// 						value: githubEvent.payload.pull_request.html_url,
	// 					});
	// 					break;
	// 				default: {
	// 					const _exhaustiveCheck: never = payload;
	// 					throw new Error(`Unhandled payload id: ${_exhaustiveCheck}`);
	// 				}
	// 			}
	// 		}
	// 		return triggerInputs;
	// 	}
	// 	case "github.pull_request.ready_for_review": {
	// 		if (githubEvent.type !== GitHubEventType.PULL_REQUEST_READY_FOR_REVIEW) {
	// 			return null;
	// 		}
	// 		const triggerInputs: GenerationInput[] = [];
	// 		for (const payload of githubTrigger.event.payloads.keyof().options) {
	// 			switch (payload) {
	// 				case "title":
	// 					triggerInputs.push({
	// 						name: "title",
	// 						value: githubEvent.payload.pull_request.title,
	// 					});
	// 					break;
	// 				case "body":
	// 					triggerInputs.push({
	// 						name: "body",
	// 						value: githubEvent.payload.pull_request.body ?? "",
	// 					});
	// 					break;
	// 				case "number":
	// 					triggerInputs.push({
	// 						name: "number",
	// 						value: githubEvent.payload.pull_request.number.toString(),
	// 					});
	// 					break;
	// 				case "pullRequestUrl":
	// 					triggerInputs.push({
	// 						name: "pullRequestUrl",
	// 						value: githubEvent.payload.pull_request.html_url,
	// 					});
	// 					break;
	// 				default: {
	// 					const _exhaustiveCheck: never = payload;
	// 					throw new Error(`Unhandled payload id: ${_exhaustiveCheck}`);
	// 				}
	// 			}
	// 		}
	// 		return triggerInputs;
	// 	}
	// 	case "github.pull_request.closed": {
	// 		if (githubEvent.type !== GitHubEventType.PULL_REQUEST_CLOSED) {
	// 			return null;
	// 		}
	// 		const triggerInputs: GenerationInput[] = [];
	// 		for (const payload of githubTrigger.event.payloads.keyof().options) {
	// 			switch (payload) {
	// 				case "title":
	// 					triggerInputs.push({
	// 						name: "title",
	// 						value: githubEvent.payload.pull_request.title,
	// 					});
	// 					break;
	// 				case "body":
	// 					triggerInputs.push({
	// 						name: "body",
	// 						value: githubEvent.payload.pull_request.body ?? "",
	// 					});
	// 					break;
	// 				case "number":
	// 					triggerInputs.push({
	// 						name: "number",
	// 						value: githubEvent.payload.pull_request.number.toString(),
	// 					});
	// 					break;
	// 				case "pullRequestUrl":
	// 					triggerInputs.push({
	// 						name: "pullRequestUrl",
	// 						value: githubEvent.payload.pull_request.html_url,
	// 					});
	// 					break;
	// 				default: {
	// 					const _exhaustiveCheck: never = payload;
	// 					throw new Error(`Unhandled payload id: ${_exhaustiveCheck}`);
	// 				}
	// 			}
	// 		}
	// 		return triggerInputs;
	// 	}
	// 	default: {
	// 		const _exhaustiveCheck: never = githubTrigger.event;
	// 		throw new Error(`Unhandled event id: ${_exhaustiveCheck}`);
	// 	}
	// }
}

function buildIssueCreatedInputs(args: BuildTriggerInputsArgs) {
	if (
		!ensureWebhookEvent(args.webhookEvent, "issues.opened") ||
		args.githubTrigger.event.id !== "github.issue.created"
	) {
		return [];
	}
	const inputs: GenerationInput[] = [];
	for (const payload of args.githubTrigger.event.payloads.keyof().options) {
		switch (payload) {
			case "title":
				inputs.push({
					name: "title",
					value: args.webhookEvent.data.payload.issue.title,
				});
				break;
			case "body":
				inputs.push({
					name: "body",
					value: args.webhookEvent.data.payload.issue.body ?? "",
				});
				break;
			default: {
				const _exhaustiveCheck: never = payload;
				throw new Error(`Unhandled payload id: ${_exhaustiveCheck}`);
			}
		}
	}
	return inputs;
}

function buildIssueClosedInputs(
	githubEvent: GitHubEvent,
	payloads: readonly ("title" | "body")[],
): GenerationInput[] | null {
	if (githubEvent.type !== GitHubEventType.ISSUES_CLOSED) {
		return null;
	}

	const inputs: GenerationInput[] = [];
	for (const payload of payloads) {
		switch (payload) {
			case "title":
				inputs.push({ name: "title", value: githubEvent.payload.issue.title });
				break;
			case "body":
				inputs.push({
					name: "body",
					value: githubEvent.payload.issue.body ?? "",
				});
				break;
			default: {
				const _exhaustiveCheck: never = payload;
				throw new Error(`Unhandled payload id: ${_exhaustiveCheck}`);
			}
		}
	}
	return inputs;
}

function buildIssueCommentInputs(
	githubEvent: GitHubEvent,
	payloads: readonly ("body" | "issueBody" | "issueNumber" | "issueTitle")[],
	callsign: string,
): GenerationInput[] | null {
	if (githubEvent.type !== GitHubEventType.ISSUE_COMMENT_CREATED) {
		return null;
	}

	const command = parseCommandFromEvent(githubEvent);
	if (command === null || command.callsign !== callsign) {
		return null;
	}

	const inputs: GenerationInput[] = [];
	for (const payload of payloads) {
		switch (payload) {
			case "body":
				inputs.push({ name: "body", value: command.content });
				break;
			case "issueBody":
				inputs.push({
					name: "issueBody",
					value: githubEvent.payload.issue.body ?? "",
				});
				break;
			case "issueNumber":
				inputs.push({
					name: "issueNumber",
					value: githubEvent.payload.issue.number.toString(),
				});
				break;
			case "issueTitle":
				inputs.push({
					name: "issueTitle",
					value: githubEvent.payload.issue.title,
				});
				break;
			default: {
				const _exhaustiveCheck: never = payload;
				throw new Error(`Unhandled payload id: ${_exhaustiveCheck}`);
			}
		}
	}
	return inputs;
}
