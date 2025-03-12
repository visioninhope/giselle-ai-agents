import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod";
import { WorkspaceId } from "..";
import { NodeId } from "../../node";

export const WorkspaceGitHubIntegrationId = createIdGenerator("wrkgth");
export type WorkspaceGitHubIntegrationId =
	typeof WorkspaceGitHubIntegrationId.schema;

export const WorkspaceGitHubIntegrationTrigger = z.enum([
	"github.issue_comment.created",
	"github.pull_request.issue_comment.created",
]);
export type WorkspaceGitHubIntegrationTrigger = z.infer<
	typeof WorkspaceGitHubIntegrationTrigger
>;

export const WorkspaceGitHubIntegrationNextAction = z.enum([
	"github.issue_comment.create",
	"github.pull_request.issue_comment.create",
]);
export type WorkspaceGitHubNextIntegrationAction = z.infer<
	typeof WorkspaceGitHubIntegrationNextAction
>;

export const WorkspaceGitHubIntegrationPayload = z.enum([
	"github.issue_comment.body",
	"github.issue_comment.issue.title",
	"github.issue_comment.issue.body",
	"github.pull_request.title",
	"github.pull_request.body",
	"github.pull_request.diff",
]);
export type WorkspaceGitHubIntegrationPayload = z.infer<
	typeof WorkspaceGitHubIntegrationPayload
>;

export const WorkspaceGitHubIntegrationPayloadNodeMap = z.object({
	payload: WorkspaceGitHubIntegrationPayload,
	nodeId: NodeId.schema,
});
export type WorkspaceGitHubIntegrationPayloadNodeMap = z.infer<
	typeof WorkspaceGitHubIntegrationPayloadNodeMap
>;

export const WorkspaceGitHubIntegrationSetting = z.object({
	id: WorkspaceGitHubIntegrationId.schema,
	workspaceId: WorkspaceId.schema,
	repositoryNodeId: z.string(),
	callsign: z.string(),
	event: WorkspaceGitHubIntegrationTrigger,
	payloadMaps: z.array(WorkspaceGitHubIntegrationPayloadNodeMap),
	nextAction: WorkspaceGitHubIntegrationNextAction,
});
export type WorkspaceGitHubIntegrationSetting = z.infer<
	typeof WorkspaceGitHubIntegrationSetting
>;
