import {
	Connection,
	Node,
	NodeLike,
	OperationNode,
	OperationNodeLike,
	RunId,
	WorkspaceId,
} from "@giselle-sdk/data-type";
import type { WebhookEvent } from "@giselle-sdk/github-tool";
import { z } from "zod/v4";

export const GenerationOriginTypeStudio = z.literal("studio");
export type GenerationOriginTypeStudio = z.infer<
	typeof GenerationOriginTypeStudio
>;

export const GenerationOriginTypeStage = z.literal("stage");
export type GenerationOriginTypeStage = z.infer<
	typeof GenerationOriginTypeStage
>;

export const GenerationOriginTypeGitHubApp = z.literal("github-app");
export type GenerationOriginTypeGitHubApp = z.infer<
	typeof GenerationOriginTypeGitHubApp
>;

export const GenerationOriginType = z.union([
	GenerationOriginTypeStudio,
	GenerationOriginTypeStage,
	GenerationOriginTypeGitHubApp,
]);
export type GenerationOriginType = z.infer<typeof GenerationOriginType>;

export const GenerationOriginStudio = z.object({
	id: WorkspaceId.schema,
	type: GenerationOriginTypeStudio,
});
export type GenerationOriginStudio = z.infer<typeof GenerationOriginStudio>;

export const GenerationOriginStage = z.object({
	id: RunId.schema,
	workspaceId: WorkspaceId.schema,
	type: GenerationOriginTypeStage,
});
export type GenerationOriginStage = z.infer<typeof GenerationOriginStage>;

export const GenerationOriginGitHubApp = z.object({
	id: RunId.schema,
	workspaceId: WorkspaceId.schema,
	type: GenerationOriginTypeGitHubApp,
});
export type GenerationOriginGitHubApp = z.infer<
	typeof GenerationOriginGitHubApp
>;

export const GenerationOrigin = z.discriminatedUnion("type", [
	GenerationOriginStudio,
	GenerationOriginStage,
	GenerationOriginGitHubApp,
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
