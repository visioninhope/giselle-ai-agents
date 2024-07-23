import type { Step } from "@/app/agents/requests";
import type { PortType } from "@/drizzle/schema";

export type NodeClass = {
	name: string;
	label: string;
	inputPorts?: Port[];
	outputPorts?: Port[];
	features?: Feature[];
	properties?: Property[];
	propertyPortMap?: Record<string, string>;
};

export type InvokeFunction = (requestStep: Step) => Promise<void>;

export type Port = { type: PortType; key: string; label?: string };

export type Property = {
	name: string;
	label?: string;
};

export type Feature = DynamicOutputPort;

type DynamicOutputPort = {
	name: "dynamicOutputPort";
};
