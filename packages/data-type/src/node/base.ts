import { createIdGenerator } from "@giselle-sdk/utils";
import { z } from "zod";

export const PortId = createIdGenerator("prt");
export type PortId = z.infer<typeof PortId.schema>;

export const InputPort = z.object({
	id: PortId.schema,
	direction: z.literal("input"),
	label: z.string().optional(),
});
export type InputPort = z.infer<typeof InputPort>;

export const OutputPort = z.object({
	id: PortId.schema,
	direction: z.literal("output"),
	label: z.string().optional(),
});
export type OutputPort = z.infer<typeof OutputPort>;

export const NodeId = createIdGenerator("nd");
export type NodeId = z.infer<typeof NodeId.schema>;

export const NodeBase = z.object({
	id: NodeId.schema,
	name: z.string().optional(),
	type: z.string(),
	inputs: z.array(InputPort),
	outputs: z.array(OutputPort),
});
export type NodeBase = z.infer<typeof NodeBase>;

export const Position = z.object({
	x: z.number(),
	y: z.number(),
});

export const NodeUIState = z.object({
	position: Position,
	selected: z.boolean().default(false).optional(),
	tab: z.string().optional(),
});
export type NodeUIState = z.infer<typeof NodeUIState>;
