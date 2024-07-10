import type { PortType } from "@/drizzle/schema";

export type NodeDef = {
	key: string;
	label: string;
	inputPorts?: Port[];
	outputPorts?: Port[];
};

export type Port = {
	type: PortType;
	label?: string;
};
