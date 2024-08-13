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

export interface DefaultPorts<
	TInputPorts extends DefaultPort<DefaultPortType, string>[],
	TOutputPorts extends DefaultPort<DefaultPortType, string>[],
> {
	inputPorts?: TInputPorts;
	outputPorts?: TOutputPorts;
}

export enum NodeClassCategory {
	Core = 0,
	Agent = 1,
}

export interface NodeClassOptions<
	TNodeClassCategory extends NodeClassCategory,
	TDefaultPorts extends DefaultPorts<any, any>,
	TBaseSchema extends BaseSchema<any, any, any> = never,
> {
	category: TNodeClassCategory;
	defaultPorts: TDefaultPorts;
	dataSchema?: TBaseSchema;
	panel?: FC;
}

export interface NodeClass<
	TNodeName extends string,
	TNodeClassCategory extends NodeClassCategory,
	TDefaultPorts extends DefaultPorts<any, any>,
	TBaseSchema extends BaseSchema<any, any, any>,
> {
	name: TNodeName;
	category: TNodeClassCategory;
	defaultPorts: TDefaultPorts;
	dataSchema?: TBaseSchema;
	panel?: FC;
}

export type PanelProps = { node: Node };
