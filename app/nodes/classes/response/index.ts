import type { NodeTemplate } from "../../type";

export const name = "Response";

export const template: NodeTemplate = {
	inputPorts: [
		{ type: "execution", key: "from" },
		{ type: "data", label: "Output", key: "output" },
	],
};
