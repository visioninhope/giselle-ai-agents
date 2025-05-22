import { z } from "zod";
import { Connection } from "../connection";
import { Node, NodeBase, OperationNode } from "../node";
import { RunId } from "../run";
import { WorkspaceId } from "../workspace";

export const GenerationOriginTypeWorkspace = z.literal("workspace");
export type GenerationOriginTypeWorkspace = z.infer<
	typeof GenerationOriginTypeWorkspace
>;

export const GenerationOriginTypeRun = z.literal("run");
export type GenerationOriginTypeRun = z.infer<typeof GenerationOriginTypeRun>;

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

export const GenerationOrigin = z.discriminatedUnion("type", [
	GenerationOriginWorkspace,
	GenerationOriginRun,
]);
export type GenerationOrigin = z.infer<typeof GenerationOrigin>;

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject {
	[key: string]: JsonValue;
}
export const JsonValue: z.ZodType<JsonValue> = z.lazy(() =>
	z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.null(),
		z.array(JsonValue),
		z.record(JsonValue),
	]),
);

export const KeyValueEntry = z.object({
	name: z.string(),
	value: z.string(),
});
export type KeyValueEntry = z.infer<typeof KeyValueEntry>;

export const KeyValueInput = z.object({
	type: z.literal("keyValue"),
	entries: z.array(KeyValueEntry),
});
export type KeyValueInput = z.infer<typeof KeyValueInput>;

export const PayloadInput = z.object({
	type: z.literal("payload"),
	event: z.string(),
	payload: JsonValue,
});
export type PayloadInput = z.infer<typeof PayloadInput>;

export const GenerationContextInput = z.discriminatedUnion("type", [
	KeyValueInput,
	PayloadInput,
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
	operationNode: NodeBase.extend({
		type: z.literal("operation"),
		content: z.any(),
	}),
	sourceNodes: z.array(z.any()),
	connections: z.array(z.any()).default([]),
	origin: GenerationOrigin,
	inputs: z.array(GenerationContextInput).optional(),
});
export type GenerationContextLike = z.infer<typeof GenerationContextLike>;
