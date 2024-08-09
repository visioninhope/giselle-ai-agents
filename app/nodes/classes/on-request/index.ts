import type { NodeTemplate } from "../../type";

export { Panel } from "./ui";

export const name = "On Request";

export const template: NodeTemplate = {
	outputPorts: [{ type: "execution", key: "to" }],
};
