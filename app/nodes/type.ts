import type { BlueprintPort, Node } from "@/app/agents/blueprints";
import type { FC, JSX } from "react";
import type { BaseSchema, InferInput, ObjectSchema } from "valibot";

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

type ResolverArgs<TBaseSchema, TDefaultPorts> = {
	requestId: number;
	node: Node;
	data: TBaseSchema extends ObjectSchema<infer E, infer M>
		? InferInput<ObjectSchema<E, M>>
		: never;
	findDefaultInputPortAsBlueprint: (
		// biome-ignore lint: lint/suspicious/noExplicitAny
		name: TDefaultPorts extends DefaultPorts<infer InputPorts, any>
			? InputPorts[number]["name"]
			: never,
	) => BlueprintPort;
	findDefaultOutputPortAsBlueprint: (
		// biome-ignore lint: lint/suspicious/noExplicitAny
		name: TDefaultPorts extends DefaultPorts<any, infer OutputPorts>
			? OutputPorts[number]["name"]
			: never,
	) => BlueprintPort;
};
type Resolver<TBaseSchema, TDefaultPorts> = (
	args: ResolverArgs<TBaseSchema, TDefaultPorts>,
) => Promise<void>;

type ActionArgs<TBaseSchema, TDefaultPorts> = ResolverArgs<
	TBaseSchema,
	TDefaultPorts
>;
type Action<TBaseSchema, TDefaultPorts> = (
	args: ActionArgs<TBaseSchema, TDefaultPorts>,
) => Promise<void>;

type RenderPanelArgs<TBaseSchema> = {
	node: Node;
	data: TBaseSchema extends ObjectSchema<infer E, infer M>
		? InferInput<ObjectSchema<E, M>>
		: never;
};
type RenderPanel<TBaseSchema> = (
	args: RenderPanelArgs<TBaseSchema>,
) => JSX.Element;

export type NodeClassOptions<
	TNodeClassCategories extends NodeClassCategory[],
	// biome-ignore lint: lint/suspicious/noExplicitAny
	TDefaultPorts extends DefaultPorts<any, any>,
	// biome-ignore lint: lint/suspicious/noExplicitAny
	TBaseSchema extends BaseSchema<any, any, any> = any,
> = {
	categories: TNodeClassCategories;
	defaultPorts: TDefaultPorts;
	dataSchema?: TBaseSchema;
	renderPanel?: RenderPanel<TBaseSchema>;
	action?: Action<TBaseSchema, TDefaultPorts>;
	resolver?: Resolver<TBaseSchema, TDefaultPorts>;
};

export type NodeClass<
	TNodeName extends string,
	TNodeClassCategories extends NodeClassCategory[],
	// biome-ignore lint: lint/suspicious/noExplicitAny
	TDefaultPorts extends DefaultPorts<any, any>,
	// biome-ignore lint: lint/suspicious/noExplicitAny
	TBaseSchema extends BaseSchema<any, any, any> = any,
> = {
	name: TNodeName;
	categories: TNodeClassCategories;
	defaultPorts: TDefaultPorts;
	dataSchema?: TBaseSchema;
	renderPanel?: RenderPanel<TBaseSchema>;
	action?: Action<TBaseSchema, TDefaultPorts>;
	resolver?: Resolver<TBaseSchema, TDefaultPorts>;
};

// biome-ignore lint: lint/suspicious/noExplicitAny
export type NodeClasses = Record<string, NodeClass<any, any, any, any>>;
