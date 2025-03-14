import { z } from "zod";
import { ActionNode, ActionNodeReference, OverrideActionNode } from "./actions";
import {
	OverrideVariableNode,
	VariableNode,
	VariableNodeReference,
} from "./variables";
export * from "./actions";
export * from "./variables";
export * from "./base";

export const Node = z.discriminatedUnion("type", [ActionNode, VariableNode]);
export type Node = z.infer<typeof Node>;

export const OverrideNode = z.discriminatedUnion("type", [
	OverrideActionNode,
	OverrideVariableNode,
]);
export type OverrideNode = z.infer<typeof OverrideNode>;

export const NodeReference = z.discriminatedUnion("type", [
	ActionNodeReference,
	VariableNodeReference,
]);
export type NodeReference = z.infer<typeof NodeReference>;
