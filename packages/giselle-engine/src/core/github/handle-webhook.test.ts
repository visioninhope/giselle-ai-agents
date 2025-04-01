import type { WorkspaceGitHubIntegrationSetting } from "@giselle-sdk/data-type";
import type {
	IssueCommentCreatedEvent,
	IssuesClosedEvent,
	IssuesOpenedEvent,
} from "@octokit/webhooks-types";
import { describe, expect, it } from "vitest";
import type { GitHubEvent } from "./events/types";
import { GitHubEventType } from "./events/types";
import { isMatchingIntegrationSetting } from "./handle-webhook";
import type { Command } from "./utils";

describe("isMatchingIntegrationSetting", () => {
	const mockSettingBase: WorkspaceGitHubIntegrationSetting = {
		id: "wrkgth-test1",
		workspaceId: "wrks-test1",
		repositoryNodeId: "repo-node-1",
		event: "github.issue_comment.created", // Default, will be overridden
		payloadMaps: [],
		nextAction: "github.issue_comment.create",
		callsign: "/giselle", // Default, will be overridden if null
	};

	const mockEventBase: GitHubEvent = {
		type: GitHubEventType.ISSUE_COMMENT_CREATED,
		event: "issue_comment",
		payload: {
			action: "created",
			repository: {
				id: 1,
				node_id: "repo-node-1",
				name: "test-repo",
				full_name: "test-owner/test-repo",
				private: false,
				owner: {
					id: 1,
					node_id: "user-node-1",
					login: "test-owner",
					avatar_url: "https://example.com/avatar.png",
					gravatar_id: "",
					url: "https://api.github.com/users/test-owner",
					html_url: "https://github.com/test-owner",
					followers_url: "https://api.github.com/users/test-owner/followers",
					following_url:
						"https://api.github.com/users/test-owner/following{/other_user}",
					gists_url: "https://api.github.com/users/test-owner/gists{/gist_id}",
					starred_url:
						"https://api.github.com/users/test-owner/starred{/owner}{/repo}",
					subscriptions_url:
						"https://api.github.com/users/test-owner/subscriptions",
					organizations_url: "https://api.github.com/users/test-owner/orgs",
					repos_url: "https://api.github.com/users/test-owner/repos",
					events_url:
						"https://api.github.com/users/test-owner/events{/privacy}",
					received_events_url:
						"https://api.github.com/users/test-owner/received_events",
					type: "User",
					site_admin: false,
				},
				html_url: "https://github.com/test-owner/test-repo",
				description: "Test repository",
				fork: false,
				url: "https://api.github.com/repos/test-owner/test-repo",
				forks_url: "https://api.github.com/repos/test-owner/test-repo/forks",
				keys_url:
					"https://api.github.com/repos/test-owner/test-repo/keys{/key_id}",
				collaborators_url:
					"https://api.github.com/repos/test-owner/test-repo/collaborators{/collaborator}",
				teams_url: "https://api.github.com/repos/test-owner/test-repo/teams",
				hooks_url: "https://api.github.com/repos/test-owner/test-repo/hooks",
				issue_events_url:
					"https://api.github.com/repos/test-owner/test-repo/issues/events{/number}",
				events_url: "https://api.github.com/repos/test-owner/test-repo/events",
				assignees_url:
					"https://api.github.com/repos/test-owner/test-repo/assignees{/user}",
				branches_url:
					"https://api.github.com/repos/test-owner/test-repo/branches{/branch}",
				tags_url: "https://api.github.com/repos/test-owner/test-repo/tags",
				blobs_url:
					"https://api.github.com/repos/test-owner/test-repo/git/blobs{/sha}",
				git_tags_url:
					"https://api.github.com/repos/test-owner/test-repo/git/tags{/sha}",
				git_refs_url:
					"https://api.github.com/repos/test-owner/test-repo/git/refs{/sha}",
				trees_url:
					"https://api.github.com/repos/test-owner/test-repo/git/trees{/sha}",
				statuses_url:
					"https://api.github.com/repos/test-owner/test-repo/statuses/{sha}",
				languages_url:
					"https://api.github.com/repos/test-owner/test-repo/languages",
				stargazers_url:
					"https://api.github.com/repos/test-owner/test-repo/stargazers",
				contributors_url:
					"https://api.github.com/repos/test-owner/test-repo/contributors",
				subscribers_url:
					"https://api.github.com/repos/test-owner/test-repo/subscribers",
				subscription_url:
					"https://api.github.com/repos/test-owner/test-repo/subscription",
				commits_url:
					"https://api.github.com/repos/test-owner/test-repo/commits{/sha}",
				git_commits_url:
					"https://api.github.com/repos/test-owner/test-repo/git/commits{/sha}",
				comments_url:
					"https://api.github.com/repos/test-owner/test-repo/comments{/number}",
				issue_comment_url:
					"https://api.github.com/repos/test-owner/test-repo/issues/comments{/number}",
				contents_url:
					"https://api.github.com/repos/test-owner/test-repo/contents/{+path}",
				compare_url:
					"https://api.github.com/repos/test-owner/test-repo/compare/{base}...{head}",
				merges_url: "https://api.github.com/repos/test-owner/test-repo/merges",
				archive_url:
					"https://api.github.com/repos/test-owner/test-repo/{archive_format}{/ref}",
				downloads_url:
					"https://api.github.com/repos/test-owner/test-repo/downloads",
				issues_url:
					"https://api.github.com/repos/test-owner/test-repo/issues{/number}",
				pulls_url:
					"https://api.github.com/repos/test-owner/test-repo/pulls{/number}",
				milestones_url:
					"https://api.github.com/repos/test-owner/test-repo/milestones{/number}",
				notifications_url:
					"https://api.github.com/repos/test-owner/test-repo/notifications{?since,all,participating}",
				labels_url:
					"https://api.github.com/repos/test-owner/test-repo/labels{/name}",
				releases_url:
					"https://api.github.com/repos/test-owner/test-repo/releases{/id}",
				deployments_url:
					"https://api.github.com/repos/test-owner/test-repo/deployments",
				created_at: "2024-04-01T00:00:00Z",
				updated_at: "2024-04-01T00:00:00Z",
				pushed_at: "2024-04-01T00:00:00Z",
				git_url: "git://github.com/test-owner/test-repo.git",
				ssh_url: "git@github.com:test-owner/test-repo.git",
				clone_url: "https://github.com/test-owner/test-repo.git",
				svn_url: "https://github.com/test-owner/test-repo",
				homepage: null,
				size: 0,
				stargazers_count: 0,
				watchers_count: 0,
				language: "TypeScript",
				has_issues: true,
				has_projects: true,
				has_downloads: true,
				has_wiki: true,
				has_pages: false,
				has_discussions: false,
				forks_count: 0,
				mirror_url: null,
				archived: false,
				disabled: false,
				open_issues_count: 0,
				license: null,
				allow_forking: true,
				is_template: false,
				web_commit_signoff_required: false,
				topics: [],
				visibility: "public",
				forks: 0,
				open_issues: 0,
				watchers: 0,
				default_branch: "main",
				allow_squash_merge: true,
				allow_merge_commit: true,
				allow_rebase_merge: true,
				allow_auto_merge: false,
				delete_branch_on_merge: false,
				custom_properties: {},
			},
			issue: {
				number: 1,
				title: "Test Issue",
				body: "Test body",
				url: "https://api.github.com/repos/test-owner/test-repo/issues/1",
				repository_url: "https://api.github.com/repos/test-owner/test-repo",
				labels_url:
					"https://api.github.com/repos/test-owner/test-repo/issues/1/labels{/name}",
				comments_url:
					"https://api.github.com/repos/test-owner/test-repo/issues/1/comments",
				events_url:
					"https://api.github.com/repos/test-owner/test-repo/issues/1/events",
				html_url: "https://github.com/test-owner/test-repo/issues/1",
				id: 1,
				node_id: "issue-node-1",
				user: {
					id: 1,
					node_id: "user-node-1",
					login: "test-owner",
					avatar_url: "https://example.com/avatar.png",
					gravatar_id: "",
					url: "https://api.github.com/users/test-owner",
					html_url: "https://github.com/test-owner",
					followers_url: "https://api.github.com/users/test-owner/followers",
					following_url:
						"https://api.github.com/users/test-owner/following{/other_user}",
					gists_url: "https://api.github.com/users/test-owner/gists{/gist_id}",
					starred_url:
						"https://api.github.com/users/test-owner/starred{/owner}{/repo}",
					subscriptions_url:
						"https://api.github.com/users/test-owner/subscriptions",
					organizations_url: "https://api.github.com/users/test-owner/orgs",
					repos_url: "https://api.github.com/users/test-owner/repos",
					events_url:
						"https://api.github.com/users/test-owner/events{/privacy}",
					received_events_url:
						"https://api.github.com/users/test-owner/received_events",
					type: "User",
					site_admin: false,
				},
				state: "open",
				locked: false,
				assignee: null,
				assignees: [],
				milestone: null,
				comments: 0,
				created_at: "2024-04-01T00:00:00Z",
				updated_at: "2024-04-01T00:00:00Z",
				closed_at: null,
				author_association: "OWNER",
				active_lock_reason: null,
				draft: false,
				pull_request: {
					url: "https://api.github.com/repos/test-owner/test-repo/pulls/1",
					html_url: "https://github.com/test-owner/test-repo/pull/1",
					diff_url: "https://github.com/test-owner/test-repo/pull/1.diff",
					patch_url: "https://github.com/test-owner/test-repo/pull/1.patch",
					merged_at: null,
				},
				labels: [],
				reactions: {
					url: "https://api.github.com/repos/test-owner/test-repo/issues/1/reactions",
					total_count: 0,
					"+1": 0,
					"-1": 0,
					laugh: 0,
					hooray: 0,
					confused: 0,
					heart: 0,
					rocket: 0,
					eyes: 0,
				},
			},
			comment: {
				id: 1,
				node_id: "comment-node-1",
				url: "https://api.github.com/repos/test-owner/test-repo/issues/comments/1",
				html_url:
					"https://github.com/test-owner/test-repo/issues/1#issuecomment-1",
				body: "/giselle do something",
				user: {
					id: 1,
					node_id: "user-node-1",
					login: "test-owner",
					avatar_url: "https://example.com/avatar.png",
					gravatar_id: "",
					url: "https://api.github.com/users/test-owner",
					html_url: "https://github.com/test-owner",
					followers_url: "https://api.github.com/users/test-owner/followers",
					following_url:
						"https://api.github.com/users/test-owner/following{/other_user}",
					gists_url: "https://api.github.com/users/test-owner/gists{/gist_id}",
					starred_url:
						"https://api.github.com/users/test-owner/starred{/owner}{/repo}",
					subscriptions_url:
						"https://api.github.com/users/test-owner/subscriptions",
					organizations_url: "https://api.github.com/users/test-owner/orgs",
					repos_url: "https://api.github.com/users/test-owner/repos",
					events_url:
						"https://api.github.com/users/test-owner/events{/privacy}",
					received_events_url:
						"https://api.github.com/users/test-owner/received_events",
					type: "User",
					site_admin: false,
				},
				created_at: "2024-04-01T00:00:00Z",
				updated_at: "2024-04-01T00:00:00Z",
				issue_url: "https://api.github.com/repos/test-owner/test-repo/issues/1",
				author_association: "OWNER",
				reactions: {
					url: "https://api.github.com/repos/test-owner/test-repo/issues/comments/1/reactions",
					total_count: 0,
					"+1": 0,
					"-1": 0,
					laugh: 0,
					hooray: 0,
					confused: 0,
					heart: 0,
					rocket: 0,
					eyes: 0,
				},
				performed_via_github_app: null,
			},
			sender: {
				id: 1,
				node_id: "user-node-1",
				login: "test-owner",
				avatar_url: "https://example.com/avatar.png",
				gravatar_id: "",
				url: "https://api.github.com/users/test-owner",
				html_url: "https://github.com/test-owner",
				followers_url: "https://api.github.com/users/test-owner/followers",
				following_url:
					"https://api.github.com/users/test-owner/following{/other_user}",
				gists_url: "https://api.github.com/users/test-owner/gists{/gist_id}",
				starred_url:
					"https://api.github.com/users/test-owner/starred{/owner}{/repo}",
				subscriptions_url:
					"https://api.github.com/users/test-owner/subscriptions",
				organizations_url: "https://api.github.com/users/test-owner/orgs",
				repos_url: "https://api.github.com/users/test-owner/repos",
				events_url: "https://api.github.com/users/test-owner/events{/privacy}",
				received_events_url:
					"https://api.github.com/users/test-owner/received_events",
				type: "User",
				site_admin: false,
			},
		} as IssueCommentCreatedEvent,
	};

	const mockCommand: Command = {
		callsign: "/giselle",
		content: "do something",
	};

	// --- Tests for github.issue_comment.created ---
	describe("when setting.event is github.issue_comment.created", () => {
		const setting = {
			...mockSettingBase,
			event: "github.issue_comment.created" as const,
			callsign: "/giselle",
		};

		it("should return true if event type is ISSUE_COMMENT_CREATED and callsigns match", () => {
			const event = { ...mockEventBase };
			expect(isMatchingIntegrationSetting(setting, event, mockCommand)).toBe(
				true,
			);
		});

		it("should return false if event type is ISSUE_COMMENT_CREATED but callsigns do not match", () => {
			const event = { ...mockEventBase };
			const differentCommand: Command = { ...mockCommand, callsign: "/other" };
			expect(
				isMatchingIntegrationSetting(setting, event, differentCommand),
			).toBe(false);
		});

		it("should return false if event type is ISSUE_COMMENT_CREATED but setting.callsign is null", () => {
			const nullCallsignSetting = { ...setting, callsign: undefined };
			const event = { ...mockEventBase };
			expect(
				isMatchingIntegrationSetting(nullCallsignSetting, event, mockCommand),
			).toBe(false);
		});

		it("should return false if event type is ISSUE_COMMENT_CREATED but command is null", () => {
			const event = { ...mockEventBase };
			expect(isMatchingIntegrationSetting(setting, event, null)).toBe(false);
		});

		it("should return false if event type is not ISSUE_COMMENT_CREATED", () => {
			const event = {
				type: GitHubEventType.ISSUES_OPENED,
				event: "issues",
				payload: {
					action: "opened",
					repository: mockEventBase.payload.repository,
					issue: mockEventBase.payload.issue,
					sender: mockEventBase.payload.sender,
				} as IssuesOpenedEvent,
			} as GitHubEvent;
			expect(isMatchingIntegrationSetting(setting, event, mockCommand)).toBe(
				false,
			);
		});
	});

	// --- Tests for github.pull_request_comment.created ---
	describe("when setting.event is github.pull_request_comment.created", () => {
		const setting = {
			...mockSettingBase,
			event: "github.pull_request_comment.created" as const,
			callsign: "/giselle",
		};

		// These tests are identical to issue_comment.created logic
		it("should return true if event type is ISSUE_COMMENT_CREATED and callsigns match", () => {
			const event = { ...mockEventBase };
			expect(isMatchingIntegrationSetting(setting, event, mockCommand)).toBe(
				true,
			);
		});

		it("should return false if event type is ISSUE_COMMENT_CREATED but callsigns do not match", () => {
			const event = { ...mockEventBase };
			const differentCommand: Command = { ...mockCommand, callsign: "/other" };
			expect(
				isMatchingIntegrationSetting(setting, event, differentCommand),
			).toBe(false);
		});

		it("should return false if event type is ISSUE_COMMENT_CREATED but setting.callsign is null", () => {
			const nullCallsignSetting = { ...setting, callsign: undefined };
			const event = { ...mockEventBase };
			expect(
				isMatchingIntegrationSetting(nullCallsignSetting, event, mockCommand),
			).toBe(false);
		});

		it("should return false if event type is ISSUE_COMMENT_CREATED but command is null", () => {
			const event = { ...mockEventBase };
			expect(isMatchingIntegrationSetting(setting, event, null)).toBe(false);
		});

		it("should return false if event type is not ISSUE_COMMENT_CREATED", () => {
			const event = {
				type: GitHubEventType.ISSUES_OPENED,
				event: "issues",
				payload: {
					action: "opened",
					repository: mockEventBase.payload.repository,
					issue: mockEventBase.payload.issue,
					sender: mockEventBase.payload.sender,
				} as IssuesOpenedEvent,
			} as GitHubEvent;
			expect(isMatchingIntegrationSetting(setting, event, mockCommand)).toBe(
				false,
			);
		});
	});

	// --- Tests for github.issues.opened ---
	describe("when setting.event is github.issues.opened", () => {
		const setting = {
			...mockSettingBase,
			event: "github.issues.opened" as const,
		};

		it("should return true if event type is ISSUES_OPENED", () => {
			const event = {
				type: GitHubEventType.ISSUES_OPENED,
				event: "issues",
				payload: {
					action: "opened",
					repository: mockEventBase.payload.repository,
					issue: mockEventBase.payload.issue,
					sender: mockEventBase.payload.sender,
				} as IssuesOpenedEvent,
			} as GitHubEvent;
			expect(isMatchingIntegrationSetting(setting, event, null)).toBe(true);
		});

		it("should return false if event type is not ISSUES_OPENED", () => {
			const event = { ...mockEventBase };
			expect(isMatchingIntegrationSetting(setting, event, null)).toBe(false);
		});
		it("should return false if event type is not ISSUES_OPENED (using ISSUES_CLOSED)", () => {
			const event = {
				type: GitHubEventType.ISSUES_CLOSED,
				event: "issues",
				payload: {
					action: "closed",
					repository: mockEventBase.payload.repository,
					issue: mockEventBase.payload.issue,
					sender: mockEventBase.payload.sender,
				} as IssuesClosedEvent,
			} as GitHubEvent;
			expect(isMatchingIntegrationSetting(setting, event, null)).toBe(false);
		});
	});

	// --- Tests for github.issues.closed ---
	describe("when setting.event is github.issues.closed", () => {
		const setting = {
			...mockSettingBase,
			event: "github.issues.closed" as const,
		};

		it("should return true if event type is ISSUES_CLOSED", () => {
			const event = {
				type: GitHubEventType.ISSUES_CLOSED,
				event: "issues",
				payload: {
					action: "closed",
					repository: mockEventBase.payload.repository,
					issue: mockEventBase.payload.issue,
					sender: mockEventBase.payload.sender,
				} as IssuesClosedEvent,
			} as GitHubEvent;
			expect(isMatchingIntegrationSetting(setting, event, null)).toBe(true);
		});

		it("should return false if event type is not ISSUES_CLOSED", () => {
			const event = { ...mockEventBase };
			expect(isMatchingIntegrationSetting(setting, event, null)).toBe(false);
		});
		it("should return false if event type is not ISSUES_CLOSED (using ISSUES_OPENED)", () => {
			const event = {
				type: GitHubEventType.ISSUES_OPENED,
				event: "issues",
				payload: {
					action: "opened",
					repository: mockEventBase.payload.repository,
					issue: mockEventBase.payload.issue,
					sender: mockEventBase.payload.sender,
				} as IssuesOpenedEvent,
			} as GitHubEvent;
			expect(isMatchingIntegrationSetting(setting, event, null)).toBe(false);
		});
	});
});
