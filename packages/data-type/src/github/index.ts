import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod";
import { NodeId } from "../node";
import { WorkspaceId } from "../workspace";

export const GitHubIntegrationId = createIdGenerator("github");
export type GitHubIntegrationId = typeof GitHubIntegrationId.schema;

export const GitHubIntegrationTriggerEvent = z.enum([
	"github.issue_comment.created",
	"github.pull_request.issue_comment.created",
]);
export type GitHubIntegrationTriggerEvent = z.infer<
	typeof GitHubIntegrationTriggerEvent
>;

export const GitHubIntegrationNextAction = z.enum([
	"github.issue_comment.create",
	"github.pull_request.issue_comment.create",
]);
export type GitHubNextIntegrationAction = z.infer<
	typeof GitHubIntegrationNextAction
>;

export const GitHubIntegrationPayload = z.enum([
	"github.issue_comment.body",
	"github.issue_comment.issue.title",
	"github.issue_comment.issue.body",
	"github.pull_request.title",
	"github.pull_request.body",
	"github.pull_request.diff",
]);
export type GitHubIntegrationPayload = z.infer<typeof GitHubIntegrationPayload>;

export const GitHubIntegrationPayloadMap = z.object({
	payload: GitHubIntegrationPayload,
	nodeId: NodeId.schema,
});
export type GitHubIntegrationPayloadMap = z.infer<
	typeof GitHubIntegrationPayloadMap
>;

export const GitHubIntegrationSetting = z.object({
	id: GitHubIntegrationId.schema,
	workspaceId: WorkspaceId.schema,
	repositoryNodeId: z.string(),
	callsign: z.string(),
	event: GitHubIntegrationTriggerEvent,
	payloadMaps: z.array(GitHubIntegrationPayloadMap),
	nextAction: GitHubIntegrationNextAction,
});
export type GitHubIntegrationSetting = z.infer<typeof GitHubIntegrationSetting>;
