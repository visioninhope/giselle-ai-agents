import type { FlowTrigger } from "@giselle-sdk/data-type";
import { FlowTriggerId } from "@giselle-sdk/data-type";
import {
	type GitHubAuthConfig,
	type WebhookEvent,
	type WebhookEventName,
	addReaction,
	ensureWebhookEvent,
} from "@giselle-sdk/github-tool";
import { createStorage } from "unstorage";
import memoryDriver from "unstorage/drivers/memory";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { runFlow } from "../flows";
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
import { parseCommand } from "./utils";

// Generate a valid test trigger ID
const mockFlowTriggerId = FlowTriggerId.generate();

// Mock dependencies
vi.mock("@giselle-sdk/github-tool", () => ({
	addReaction: vi.fn().mockResolvedValue(undefined),
	ensureWebhookEvent: vi.fn(),
}));

vi.mock("../flows", () => ({
	runFlow: vi.fn(),
}));

vi.mock("./utils", () => ({
	parseCommand: vi.fn().mockReturnValue({ callsign: undefined, content: "" }),
}));

describe("GitHub Event Handlers", () => {
	// Common test data
	let baseEventArgs: Omit<EventHandlerArgs<WebhookEventName>, "event">;

	beforeEach(() => {
		vi.resetAllMocks();

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
			deps: {
				addReaction,
				ensureWebhookEvent,
				runFlow,
				parseCommand,
			},
		};

		// Mock ensureWebhookEvent by default to return true
		vi.mocked(ensureWebhookEvent).mockReturnValue(true);
	});

	describe("handleIssueOpened", () => {
		it("should handle issue opened event and add reaction", async () => {
			// Arrange
			const args = {
				...baseEventArgs,
				event: {
					data: {
						payload: {
							installation: { id: 12345 },
							repository: { node_id: "repo-node-id" },
							issue: { node_id: "issue-node-id" },
						},
					},
				} as WebhookEvent<WebhookEventName>,
			};
			args.trigger.configuration.event.id = "github.issue.created";

			// Act
			const result = await handleIssueOpened(args);

			// Assert
			expect(result.shouldRun).toBe(true);
			expect(addReaction).toHaveBeenCalledWith({
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
					data: {
						payload: {
							installation: { id: 12345 },
							repository: { node_id: "repo-node-id" },
						},
					},
				} as WebhookEvent<WebhookEventName>,
			};
			args.trigger.configuration.event.id = "github.issue.created";
			vi.mocked(ensureWebhookEvent).mockReturnValue(false);

			// Act
			const result = await handleIssueOpened(args);

			// Assert
			expect(result.shouldRun).toBe(false);
			expect(addReaction).not.toHaveBeenCalled();
		});

		it("should not run if trigger event ID doesn't match", async () => {
			// Arrange
			const args = {
				...baseEventArgs,
				event: {
					data: {
						payload: {
							installation: { id: 12345 },
							repository: { node_id: "repo-node-id" },
						},
					},
				} as WebhookEvent<WebhookEventName>,
			};
			args.trigger.configuration.event.id = "manual";

			// Act
			const result = await handleIssueOpened(args);

			// Assert
			expect(result.shouldRun).toBe(false);
			expect(addReaction).not.toHaveBeenCalled();
		});
	});

	describe("handleIssueClosed", () => {
		it("should handle issue closed event and add reaction", async () => {
			// Arrange
			const args = {
				...baseEventArgs,
				event: {
					data: {
						payload: {
							installation: { id: 12345 },
							repository: { node_id: "repo-node-id" },
							issue: { node_id: "issue-node-id" },
						},
					},
				} as WebhookEvent<WebhookEventName>,
			};
			args.trigger.configuration.event.id = "github.issue.closed";

			// Act
			const result = await handleIssueClosed(args);

			// Assert
			expect(result.shouldRun).toBe(true);
			expect(addReaction).toHaveBeenCalledWith({
				id: "issue-node-id",
				content: "EYES",
				authConfig: args.authConfig,
			});
		});
	});

	describe("handleIssueCommentCreated", () => {
		it("should handle issue comment created event with matching callsign", async () => {
			// Arrange
			const args = {
				...baseEventArgs,
				event: {
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
				} as WebhookEvent<WebhookEventName>,
			};
			args.trigger.configuration.event.id = "github.issue_comment.created";
			vi.mocked(parseCommand).mockReturnValue({
				callsign: "giselle",
				content: "help me",
			});

			// Act
			const result = await handleIssueCommentCreated(args);

			// Assert
			expect(result.shouldRun).toBe(true);
			expect(addReaction).toHaveBeenCalledWith({
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
				} as WebhookEvent<WebhookEventName>,
			};
			args.trigger.configuration.event.id = "github.issue_comment.created";
			vi.mocked(parseCommand).mockReturnValue({
				callsign: "someone",
				content: "help me",
			});

			// Act
			const result = await handleIssueCommentCreated(args);

			// Assert
			expect(result.shouldRun).toBe(false);
			expect(addReaction).not.toHaveBeenCalled();
		});
	});

	describe("processEvent", () => {
		it("should process event and run flow when handler returns shouldRun=true", async () => {
			// Arrange
			const event = {
				data: {
					payload: {
						installation: { id: 12345 },
						repository: { node_id: "repo-node-id" },
						issue: { node_id: "issue-node-id" },
					},
				},
			} as WebhookEvent<WebhookEventName>;

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

			vi.mocked(ensureWebhookEvent).mockImplementation(
				(event, type) => type === "issues.opened",
			);

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
				deps: {
					addReaction,
					ensureWebhookEvent,
					runFlow,
					parseCommand,
				},
			});

			// Assert
			expect(result).toBe(true);
			expect(runFlow).toHaveBeenCalledWith({
				context: expect.anything(),
				triggerId: mockFlowTriggerId,
				payload: event,
			});
		});

		it("should return false when trigger is disabled", async () => {
			// Arrange
			const event = {
				data: {
					payload: {
						installation: { id: 12345 },
						repository: { node_id: "repo-node-id" },
					},
				},
			} as WebhookEvent<WebhookEventName>;

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
				deps: {
					addReaction,
					ensureWebhookEvent,
					runFlow,
					parseCommand,
				},
			});

			// Assert
			expect(result).toBe(false);
			expect(runFlow).not.toHaveBeenCalled();
		});

		it("should return false when provider is not github", async () => {
			// Arrange
			const event = {
				data: {
					payload: {
						installation: { id: 12345 },
						repository: { node_id: "repo-node-id" },
					},
				},
			} as WebhookEvent<WebhookEventName>;

			const trigger = {
				id: mockFlowTriggerId,
				workspaceId: "wrks-test",
				nodeId: "nd-test",
				enable: true,
				configuration: {
					provider: "not-github" as unknown as "github",
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
				deps: {
					addReaction,
					ensureWebhookEvent,
					runFlow,
					parseCommand,
				},
			});

			// Assert
			expect(result).toBe(false);
			expect(runFlow).not.toHaveBeenCalled();
		});

		it("should return false when no handler returns shouldRun=true", async () => {
			// Arrange
			const event = {
				data: {
					payload: {
						installation: { id: 12345 },
						repository: { node_id: "repo-node-id" },
					},
				},
			} as WebhookEvent<WebhookEventName>;
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

			vi.mocked(ensureWebhookEvent).mockReturnValue(false);

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
				deps: {
					addReaction,
					ensureWebhookEvent,
					runFlow,
					parseCommand,
				},
			});

			// Assert
			expect(result).toBe(false);
			expect(runFlow).not.toHaveBeenCalled();
		});
	});
});
