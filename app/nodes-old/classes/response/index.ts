import { NodeClassCategory, type NodeTemplate } from "../../type";

export const name = "Response";

export const category = NodeClassCategory.Core;

export const template: NodeTemplate = {
	inputPorts: [
		{ type: "execution", key: "from" },
		{ type: "data", label: "Output", key: "output" },
	],
};

export { action } from "./action";
