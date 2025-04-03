// packages/giselle-engine/src/core/github/types.ts

import type {
	IssueCommentCreatedEvent,
	IssuesClosedEvent,
	IssuesOpenedEvent,
} from "@octokit/webhooks-types";

export enum GitHubEventType {
	ISSUE_COMMENT_CREATED = "issue_comment.created",
	ISSUES_OPENED = "issues.opened",
	ISSUES_CLOSED = "issues.closed",
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
	  };
