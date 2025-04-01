import type {
	IssueCommentCreatedEvent,
	IssuesClosedEvent,
	IssuesOpenedEvent,
} from "@octokit/webhooks-types";
import { GitHubEventType, type GitHubEvent } from "./types";

function isIssueCommentCreatedPayload(
	event: string,
	payload: unknown,
): payload is IssueCommentCreatedEvent {
	return (
		event === "issue_comment" &&
		typeof payload === "object" &&
		payload !== null &&
		"action" in payload &&
		payload.action === "created" &&
		"comment" in payload &&
		typeof payload.comment === "object" &&
		payload.comment !== null &&
		"repository" in payload &&
		typeof payload.repository === "object" &&
		payload.repository !== null
	);
}

function isIssuesOpenedPayload(
	event: string,
	payload: unknown,
): payload is IssuesOpenedEvent {
	return (
		event === "issues" &&
		typeof payload === "object" &&
		payload !== null &&
		"action" in payload &&
		payload.action === "opened" &&
		"issue" in payload &&
		typeof payload.issue === "object" &&
		payload.issue !== null &&
		"repository" in payload &&
		typeof payload.repository === "object" &&
		payload.repository !== null
	);
}

function isIssuesClosedPayload(
	event: string,
	payload: unknown,
): payload is IssuesClosedEvent {
	return (
		event === "issues" &&
		typeof payload === "object" &&
		payload !== null &&
		"action" in payload &&
		payload.action === "closed" &&
		"issue" in payload &&
		typeof payload.issue === "object" &&
		payload.issue !== null &&
		"repository" in payload &&
		typeof payload.repository === "object" &&
		payload.repository !== null
	);
}

export function determineGitHubEvent(
	event: string,
	payload: unknown,
): GitHubEvent | null {
	if (isIssueCommentCreatedPayload(event, payload)) {
		return {
			type: GitHubEventType.ISSUE_COMMENT_CREATED,
			event: "issue_comment",
			payload,
		};
	}

	if (isIssuesOpenedPayload(event, payload)) {
		return {
			type: GitHubEventType.ISSUES_OPENED,
			event: "issues",
			payload,
		};
	}

	if (isIssuesClosedPayload(event, payload)) {
		return {
			type: GitHubEventType.ISSUES_CLOSED,
			event: "issues",
			payload,
		};
	}

	return null;
}
