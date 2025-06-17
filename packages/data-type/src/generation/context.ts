import type { WebhookEvent } from "@giselle-sdk/github-tool";
import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod/v4";
import { Connection } from "../connection";
import { Node, NodeLike, OperationNode, OperationNodeLike } from "../node";
import { RunId } from "../run";
import { WorkspaceId } from "../workspace";

export const GenerationOriginTypeWorkspace = z.literal("workspace");
export type GenerationOriginTypeWorkspace = z.infer<
	typeof GenerationOriginTypeWorkspace
>;

export const GenerationOriginTypeRun = z.literal("run");
export type GenerationOriginTypeRun = z.infer<typeof GenerationOriginTypeRun>;

export const GenerationOriginTypeFlowRun = z.literal("flowRun");
export type GenerationOriginTypeFlowRun = z.infer<
	typeof GenerationOriginTypeFlowRun
>;

export const GenerationOriginType = z.union([
	GenerationOriginTypeWorkspace,
	GenerationOriginTypeRun,
]);
export type GenerationOriginType = z.infer<typeof GenerationOriginType>;

export const GenerationOriginWorkspace = z.object({
	id: WorkspaceId.schema,
	type: GenerationOriginTypeWorkspace,
});
export type GenerationOriginWorkspace = z.infer<
	typeof GenerationOriginWorkspace
>;

export const GenerationOriginRun = z.object({
	id: RunId.schema,
	workspaceId: WorkspaceId.schema,
	type: GenerationOriginTypeRun,
});
export type GenerationOriginRun = z.infer<typeof GenerationOriginRun>;

// Temporary definition, will reference GiselleEngine's definition once migrated
// there, but duplicating the definition for now
const FlowRunId = createIdGenerator("flrn");
const GenerationOriginFlowRun = z.object({
	id: FlowRunId.schema,
	workspaceId: WorkspaceId.schema,
	type: GenerationOriginTypeFlowRun,
});

export const GenerationOrigin = z.discriminatedUnion("type", [
	GenerationOriginWorkspace,
	GenerationOriginRun,
	GenerationOriginFlowRun,
]);
export type GenerationOrigin = z.infer<typeof GenerationOrigin>;

export const StringParameterItem = z.object({
	name: z.string(),
	type: z.literal("string"),
	value: z.string(),
});
export type StringParameterItem = z.infer<typeof StringParameterItem>;

export const NumberParameterItem = z.object({
	name: z.string(),
	type: z.literal("number"),
	value: z.number(),
});
export type NumberParameterItem = z.infer<typeof NumberParameterItem>;

export const ParameterItem = z.discriminatedUnion("type", [
	StringParameterItem,
	NumberParameterItem,
]);
export type ParameterItem = z.infer<typeof ParameterItem>;

export const ParametersInput = z.object({
	type: z.literal("parameters"),
	items: z.array(ParameterItem),
});
export type ParametersInput = z.infer<typeof ParametersInput>;

export const GitHubWebhookEventInput = z.object({
	type: z.literal("github-webhook-event"),
	webhookEvent: z.custom<WebhookEvent>(),
});
export type GitHubWebhookEventInput = z.infer<typeof GitHubWebhookEventInput>;

export const GenerationContextInput = z.discriminatedUnion("type", [
	ParametersInput,
	GitHubWebhookEventInput,
]);
export type GenerationContextInput = z.infer<typeof GenerationContextInput>;

export const GenerationContext = z.object({
	operationNode: OperationNode,
	connections: z.array(Connection).default([]),
	sourceNodes: z.array(Node),
	origin: GenerationOrigin,
	inputs: z
		.array(GenerationContextInput)
		.optional()
		.describe(
			"Inputs from node connections are represented in sourceNodes, while this represents inputs from the external environment. Mainly used with Trigger nodes.",
		),
});
export type GenerationContext = z.infer<typeof GenerationContext>;

export const GenerationContextLike = z.object({
	operationNode: OperationNodeLike,
	sourceNodes: z.array(NodeLike),
	connections: z.array(z.any()).default([]),
	origin: GenerationOrigin,
	inputs: z.array(GenerationContextInput).optional(),
});
export type GenerationContextLike = z.infer<typeof GenerationContextLike>;
