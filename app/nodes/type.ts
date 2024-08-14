import type { Blueprint, Node } from "@/app/agents/blueprints";
import type { FC } from "react";
import type { BaseSchema } from "valibot";

export enum DefaultPortType {
	Execution = "execution",
	Data = "data",
}
export type DefaultPort<TType extends DefaultPortType, TName extends string> = {
	type: TType;
	name: TName;
};

export type DefaultPorts<
	TInputPorts extends DefaultPort<DefaultPortType, string>[],
	TOutputPorts extends DefaultPort<DefaultPortType, string>[],
> = {
	inputPorts?: TInputPorts;
	outputPorts?: TOutputPorts;
};

export enum NodeClassCategory {
	Trigger = "trigger",
	LLM = "llm",
	Response = "response",
	Utility = "utility",
}

type ActionArgs = {
	requestId: number;
	nodeId: number;
	blueprint: Blueprint;
};
export type Action = (args: ActionArgs) => Promise<void>;

type ResolverArgs = {
	requestId: number;
	nodeId: number;
	blueprint: Blueprint;
};
export type Resolver = (args: ResolverArgs) => Promise<void>;

export type NodeClassOptions<
	TNodeClassCategories extends NodeClassCategory[],
	TDefaultPorts extends DefaultPorts<any, any>,
	TBaseSchema extends BaseSchema<any, any, any> = never,
> = {
	categories: TNodeClassCategories;
	defaultPorts: TDefaultPorts;
	dataSchema?: TBaseSchema;
	panel?: FC<PanelProps>;
	action?: Action;
	resolver?: Resolver;
};

export type NodeClass<
	TNodeName extends string,
	TNodeClassCategories extends NodeClassCategory[],
	TDefaultPorts extends DefaultPorts<any, any>,
	TBaseSchema extends BaseSchema<any, any, any> = never,
> = {
	name: TNodeName;
	categories: TNodeClassCategories;
	defaultPorts: TDefaultPorts;
	dataSchema?: TBaseSchema;
	panel?: FC<PanelProps>;
	action?: Action;
	resolver?: Resolver;
};

export type NodeClasses = Record<string, NodeClass<any, any, any, any>>;

export type PanelProps = { node: Node };
