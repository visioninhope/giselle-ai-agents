import type { Node } from "@/app/agents/blueprints";
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
	Core = 0,
	Agent = 1,
}

export type NodeClassOptions<
	TNodeClassCategory extends NodeClassCategory,
	TDefaultPorts extends DefaultPorts<any, any>,
	TBaseSchema extends BaseSchema<any, any, any> = never,
> = {
	category: TNodeClassCategory;
	defaultPorts: TDefaultPorts;
	dataSchema?: TBaseSchema;
	panel?: FC<PanelProps>;
};

export type NodeClass<
	TNodeName extends string,
	TNodeClassCategory extends NodeClassCategory,
	TDefaultPorts extends DefaultPorts<any, any>,
	TBaseSchema extends BaseSchema<any, any, any> = never,
> = {
	name: TNodeName;
	category: TNodeClassCategory;
	defaultPorts: TDefaultPorts;
	dataSchema?: TBaseSchema;
	panel?: FC<PanelProps>;
};

export type NodeClasses = Record<string, NodeClass<any, any, any, any>>;

export type PanelProps = { node: Node };
