// packages/giselle-engine/src/core/github/types.ts

import type {
	IssueCommentCreatedEvent,
	IssuesClosedEvent,
	IssuesOpenedEvent,
	PullRequestOpenedEvent,
} from "@octokit/webhooks-types";

export enum GitHubEventType {
	ISSUE_COMMENT_CREATED = "issue_comment.created",
	ISSUES_OPENED = "issues.opened",
	ISSUES_CLOSED = "issues.closed",
	PULL_REQUEST_OPENED = "pull_request.opened",
}

export type GitHubEvent =
	| {
			type: GitHubEventType.ISSUE_COMMENT_CREATED;
			event: "issue_comment";
			payload: IssueCommentCreatedEvent;
	  }
	| {
			type: GitHubEventType.ISSUES_OPENED;
			event: "issues";
			payload: IssuesOpenedEvent;
	  }
	| {
			type: GitHubEventType.ISSUES_CLOSED;
			event: "issues";
			payload: IssuesClosedEvent;
	  }
	| {
			type: GitHubEventType.PULL_REQUEST_OPENED;
			event: "pull_request";
			payload: PullRequestOpenedEvent;
	  };
