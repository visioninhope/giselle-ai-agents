import { z } from "zod";
import { ActionNode } from "./actions";
import { VariableNode } from "./variables";
export * from "./actions";
export * from "./variables";
export * from "./base";
export * from "./connection";

export const Node = z.discriminatedUnion("type", [ActionNode, VariableNode]);
export type Node = z.infer<typeof Node>;
