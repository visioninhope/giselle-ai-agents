import type { PortType } from "@/drizzle/schema";

export type NodeClass = {
	name: string;
	label: string;
	inputPorts?: Port[];
	outputPorts?: Port[];
};

export type Port = {
	type: PortType;
	label?: string;
};

export type Feature = Array<DynamicOutputPort>;

type DynamicOutputPort = {
	class: "dynamicOutputPort";
};
