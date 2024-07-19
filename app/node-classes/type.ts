import type { RequestStep } from "@/app/agents/requests";
import type { PortType } from "@/drizzle/schema";

export type NodeClass = {
	name: string;
	label: string;
	inputPorts?: Port[];
	outputPorts?: Port[];
	features?: Feature[];
};

export type InvokeFunction = (requestStep: RequestStep) => Promise<void>;

export type Port = {
	type: PortType;
	label?: string;
};

export type Feature = DynamicOutputPort;

type DynamicOutputPort = {
	name: "dynamicOutputPort";
};
