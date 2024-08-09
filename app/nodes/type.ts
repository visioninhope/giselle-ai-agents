import type { Blueprint, Node } from "@/app/agents/blueprints";
import type { Step } from "@/app/agents/requests";
import type { PortType } from "@/drizzle/schema";
import type { FC } from "react";

// export type NodeClass = {
// 	name: string;
// 	label: string;
// 	inputPorts?: Port[];
// 	outputPorts?: Port[];
// 	features?: Feature[];
// 	properties?: Property[];
// 	propertyPortMap?: Record<string, string>;
// };

export type Action = (requestStep: Step) => Promise<void>;

export type Port = { type: PortType; key: string; label?: string };

export type Property = {
	name: string;
	label?: string;
};

// export type Feature = DynamicOutputPort | DynamicInputPort;

// type DynamicOutputPort = {
// 	name: "dynamicOutputPort";
// };
// type DynamicInputPort = {
// 	name: "dynamicInputPort";
// };

type ResolverArgs = {
	requestId: number;
	nodeId: number;
	blueprint: Blueprint;
};
export type Resolver = (args: ResolverArgs) => Promise<void>;

export type NodeTemplate = {
	inputPorts?: Port[];
	outputPorts?: Port[];
	properties?: Property[];
};
export type PanelProps = { node: Node };
export type NodeClass = {
	name: string;
	action?: Action;
	resolver?: Resolver;
	Panel?: FC<PanelProps>;
	template: NodeTemplate;
};
