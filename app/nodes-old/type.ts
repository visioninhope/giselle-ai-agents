import type { Blueprint, Node } from "@/app/agents/blueprints";
import type { Step } from "@/app/agents/requests";
import type { NodeData, NodeProperties, PortType } from "@/drizzle/schema";
import type { FC } from "react";
import type { AnySchema } from "valibot";

export type Action = (requestStep: Step) => Promise<void>;

export type Port = { type: PortType; key: string; label?: string };

type ResolverArgs = {
	requestId: number;
	nodeId: number;
	blueprint: Blueprint;
};
export type Resolver = (args: ResolverArgs) => Promise<void>;

export type NodeTemplate = {
	inputPorts?: Port[];
	outputPorts?: Port[];
	properties?: NodeProperties;
};
export type PanelProps = { node: Node };
export enum NodeClassCategory {
	Agent = "agent",
	Core = "core",
}
type BaseNodeClass<T extends AnySchema = any> = {
	name: string;
	category: NodeClassCategory;
	action?: Action;
	resolver?: Resolver;
	Panel?: FC<PanelProps>;
	template: NodeTemplate;
	data?: NodeData;
	dataSchema?: T;
};
export type CoreNodeClass<T extends AnySchema = any> = BaseNodeClass<T> & {
	category: NodeClassCategory.Core;
};
export type AgentNodeClass<T extends AnySchema = any> = BaseNodeClass<T> & {
	category: NodeClassCategory.Agent;
};

export type NodeClass = CoreNodeClass | AgentNodeClass;
