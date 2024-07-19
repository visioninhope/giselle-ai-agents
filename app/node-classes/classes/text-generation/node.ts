import type { Port } from "../../type";

export const name = "textGeneration";

export const label = "Text Generation";

export const inputPorts: Port[] = [
	{ type: "execution", key: "from" },
	{ type: "data", label: "Instruction", key: "instruction" },
];
export const outputPorts: Port[] = [
	{ type: "execution", key: "to" },
	{ type: "data", label: "Result", key: "result" },
];
