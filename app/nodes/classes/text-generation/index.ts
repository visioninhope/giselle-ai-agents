import type { NodeTemplate } from "../../type";

export const name = "Text Generation";

export const template: NodeTemplate = {
	inputPorts: [
		{ type: "execution", key: "from" },
		{ type: "data", label: "Instruction", key: "instruction" },
	],
	outputPorts: [
		{ type: "execution", key: "to" },
		{ type: "data", label: "Result", key: "result" },
	],
};

export { action } from "./action";
