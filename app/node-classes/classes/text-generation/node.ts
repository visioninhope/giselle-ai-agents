import type { Port } from "../../type";

export const name = "textGeneration";

export const label = "Text Generation";

export const inputPorts: Port[] = [
	{ type: "execution" },
	{ type: "data", label: "Instruction" },
];
export const outputPorts: Port[] = [
	{ type: "execution" },
	{ type: "data", label: "Result" },
];
