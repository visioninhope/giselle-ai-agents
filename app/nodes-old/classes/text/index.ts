import { NodeClassCategory, type NodeTemplate } from "../../type";

export const name = "Text";

export const category = NodeClassCategory.Core;

export const template: NodeTemplate = {
	outputPorts: [{ type: "data", label: "Text", key: "text-output" }],
	properties: [{ name: "text", label: "Text", value: "" }],
};

export { Panel } from "./ui";
export { resolver } from "./resolver";
