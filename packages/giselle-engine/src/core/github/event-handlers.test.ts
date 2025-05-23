import type { FlowTrigger } from "@giselle-sdk/data-type";
import { FlowTriggerId } from "@giselle-sdk/data-type";
import type {
	GitHubAuthConfig,
	WebhookEvent,
	WebhookEventName,
} from "@giselle-sdk/github-tool";
import { createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GiselleEngineContext } from "../types";
import {
	type EventHandlerArgs,
	type EventHandlerDependencies,
	handleIssueClosed,
	handleIssueCommentCreated,
	handleIssueOpened,
	handlePullRequestClosed,
	handlePullRequestCommentCreated,
	handlePullRequestOpened,
	handlePullRequestReadyForReview,
	processEvent,
} from "./event-handlers";

// Define test-specific types
type TestWebhookEvent = WebhookEvent<WebhookEventName>;

// Generate a valid test trigger ID
const mockFlowTriggerId = FlowTriggerId.generate();

describe("GitHub Event Handlers (Using Dependency Injection)", () => {
	// Common test data
	let testDeps: EventHandlerDependencies;
	let baseEventArgs: Omit<EventHandlerArgs<WebhookEventName>, "event">;

	beforeEach(() => {
		vi.resetAllMocks();

		// Simple dependency mocks with correct type implementations
		testDeps = {
			addReaction: vi.fn().mockResolvedValue(undefined),
			ensureWebhookEvent: vi
				.fn()
				.mockImplementation(
					<T extends WebhookEventName>(
						event: WebhookEvent<WebhookEventName>,
						expectedName: T,
					): event is WebhookEvent<T> => true,
				) as unknown as typeof import("@giselle-sdk/github-tool").ensureWebhookEvent,
			runFlow: vi.fn().mockResolvedValue(undefined),
			parseCommand: vi
				.fn()
				.mockReturnValue({ callsign: "giselle", content: "help me" }),
		};

		// Setup base arguments
		baseEventArgs = {
			context: {
				storage: createStorage({ driver: memoryDriver() }),
				llmProviders: [],
				integrationConfigs: {
					github: {
						auth: {
							strategy: "personal-access-token",
							personalAccessToken: "test-token",
						},
						authV2: {
							appId: "app-id",
							privateKey: "private-key",
							clientId: "client-id",
							clientSecret: "client-secret",
							webhookSecret: "webhook-secret",
						},
					},
				},
			} as unknown as GiselleEngineContext,
			trigger: {
				id: mockFlowTriggerId,
				workspaceId: "wrks-test",
				nodeId: "nd-test",
				configuration: {
					provider: "github",
					event: {
						id: "github.issue.created",
						conditions: {
							callsign: "giselle",
						},
					},
					installationId: 12345,
					repositoryNodeId: "repo-node-id",
				},
				enable: true,
			} as FlowTrigger,
			authConfig: {
				strategy: "app-installation",
				appId: "app-id",
				privateKey: "private-key",
				installationId: 12345,
			} as GitHubAuthConfig,
			deps: testDeps,
		};
	});

	describe("handleIssueOpened", () => {
		it("should handle issue opened event and add reaction", async () => {
			// Arrange
			const args = {
				...baseEventArgs,
				event: {
					name: "issues.opened",
					data: {
						payload: {
							installation: { id: 12345 },
							repository: { node_id: "repo-node-id" },
							issue: { node_id: "issue-node-id" },
						},
					},
				} as TestWebhookEvent,
			};

			// Act
			const result = await handleIssueOpened(args);

			// Assert
			expect(result.shouldRun).toBe(true);
			expect(args.deps.addReaction).toHaveBeenCalledWith({
				id: "issue-node-id",
				content: "EYES",
				authConfig: args.authConfig,
			});
		});

		it("should not run if event type doesn't match", async () => {
			// Arrange
			const args = {
				...baseEventArgs,
				event: {
					name: "issues.opened",
					data: {
						payload: {
							installation: { id: 12345 },
							repository: { node_id: "repo-node-id" },
						},
					},
				} as TestWebhookEvent,
			};
			args.deps = {
				...args.deps,
				ensureWebhookEvent: vi
					.fn()
					.mockImplementation(
						<T extends WebhookEventName>(
							event: WebhookEvent<WebhookEventName>,
							expectedName: T,
						): event is WebhookEvent<T> => false,
					) as unknown as typeof import("@giselle-sdk/github-tool").ensureWebhookEvent,
			};

			// Act
			const result = await handleIssueOpened(args);

			// Assert
			expect(result.shouldRun).toBe(false);
			expect(args.deps.addReaction).not.toHaveBeenCalled();
		});

		it("should not run if trigger event ID doesn't match", async () => {
			// Arrange
			const args = {
				...baseEventArgs,
				event: {
					name: "issues.opened",
					data: {
						payload: {
							installation: { id: 12345 },
							repository: { node_id: "repo-node-id" },
						},
					},
				} as TestWebhookEvent,
			};
			args.trigger.configuration.event.id = "manual";

			// Act
			const result = await handleIssueOpened(args);

			// Assert
			expect(result.shouldRun).toBe(false);
			expect(args.deps.addReaction).not.toHaveBeenCalled();
		});
	});

	describe("handleIssueCommentCreated", () => {
		it("should handle issue comment created event with matching callsign", async () => {
			// Arrange
			const args = {
				...baseEventArgs,
				event: {
					name: "issue_comment.created",
					data: {
						payload: {
							installation: { id: 12345 },
							repository: { node_id: "repo-node-id" },
							comment: {
								node_id: "comment-node-id",
								body: "@giselle help me",
							},
						},
					},
				} as TestWebhookEvent,
			};
			args.trigger.configuration.event.id = "github.issue_comment.created";

			// Act
			const result = await handleIssueCommentCreated(args);

			// Assert
			expect(result.shouldRun).toBe(true);
			expect(args.deps.parseCommand).toHaveBeenCalledWith("@giselle help me");
			expect(args.deps.addReaction).toHaveBeenCalledWith({
				id: "comment-node-id",
				content: "EYES",
				authConfig: args.authConfig,
			});
		});

		it("should not run if callsign doesn't match", async () => {
			// Arrange
			const args = {
				...baseEventArgs,
				event: {
					name: "issue_comment.created",
					data: {
						payload: {
							installation: { id: 12345 },
							repository: { node_id: "repo-node-id" },
							comment: {
								node_id: "comment-node-id",
								body: "@someone help me",
							},
						},
					},
				} as TestWebhookEvent,
			};
			args.trigger.configuration.event.id = "github.issue_comment.created";
			args.deps = {
				...args.deps,
				parseCommand: vi.fn().mockReturnValue({
					callsign: "someone",
					content: "help me",
				}),
			};

			// Act
			const result = await handleIssueCommentCreated(args);

			// Assert
			expect(result.shouldRun).toBe(false);
			expect(args.deps.addReaction).not.toHaveBeenCalled();
		});
	});

	describe("processEvent", () => {
		it("should process event and run flow when handler returns shouldRun=true", async () => {
			// Arrange
			const event = {
				name: "issues.opened",
				data: {
					payload: {
						installation: { id: 12345 },
						repository: { node_id: "repo-node-id" },
						issue: { node_id: "issue-node-id" },
					},
				},
			} as TestWebhookEvent;

			const trigger = {
				id: mockFlowTriggerId,
				workspaceId: "wrks-test",
				nodeId: "nd-test",
				enable: true,
				configuration: {
					provider: "github",
					event: {
						id: "github.issue.created",
					},
					installationId: 12345,
					repositoryNodeId: "repo-node-id",
				},
			} as FlowTrigger;

			const createAuthConfig = vi.fn().mockReturnValue({
				strategy: "app-installation",
				appId: "app-id",
				privateKey: "private-key",
				installationId: 12345,
			});

			// Act
			const result = await processEvent({
				event,
				context: {
					llmProviders: [],
					storage: createStorage({ driver: memoryDriver() }),
					integrationConfigs: {
						github: {
							auth: {
								strategy: "personal-access-token",
								personalAccessToken: "test-token",
							},
							authV2: {
								appId: "app-id",
								privateKey: "private-key",
								clientId: "client-id",
								clientSecret: "client-secret",
								webhookSecret: "webhook-secret",
							},
						},
					},
				} as unknown as GiselleEngineContext,
				trigger,
				createAuthConfig,
				deps: testDeps,
			});

			// Assert
			expect(result).toBe(true);
			expect(testDeps.runFlow).toHaveBeenCalledWith({
				context: expect.anything(),
				triggerId: mockFlowTriggerId,
				payload: event,
			});
		});

		it("should return false when trigger is disabled", async () => {
			// Arrange
			const event = {
				name: "issues.opened",
				data: {
					payload: {
						installation: { id: 12345 },
						repository: { node_id: "repo-node-id" },
					},
				},
			} as TestWebhookEvent;

			const trigger = {
				id: mockFlowTriggerId,
				workspaceId: "wrks-test",
				nodeId: "nd-test",
				enable: false,
				configuration: {
					provider: "github",
					event: {
						id: "github.issue.created",
					},
					installationId: 12345,
					repositoryNodeId: "repo-node-id",
				},
			} as FlowTrigger;

			// Act
			const result = await processEvent({
				event,
				context: {
					llmProviders: [],
					storage: createStorage({ driver: memoryDriver() }),
					integrationConfigs: {
						github: {
							auth: {
								strategy: "personal-access-token",
								personalAccessToken: "test-token",
							},
							authV2: {
								appId: "app-id",
								privateKey: "private-key",
								clientId: "client-id",
								clientSecret: "client-secret",
								webhookSecret: "webhook-secret",
							},
						},
					},
				} as unknown as GiselleEngineContext,
				trigger,
				createAuthConfig: vi.fn(),
				deps: testDeps,
			});

			// Assert
			expect(result).toBe(false);
			expect(testDeps.runFlow).not.toHaveBeenCalled();
		});
	});
});
