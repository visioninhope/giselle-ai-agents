import { number, object, string } from "valibot";
import { NodeClassCategory, type NodeTemplate } from "../../type";

export const name = "Agent";

export const category = NodeClassCategory.Agent;

export const template: NodeTemplate = {
	inputPorts: [{ type: "execution", key: "from" }],
	outputPorts: [
		{ type: "execution", key: "to" },
		{
			type: "data",
			key: "result",
			label: "Result",
		},
	],
};

export const dataSchema = object({
	relevantAgent: object({
		id: number(),
		blueprintId: number(),
		name: string(),
	}),
});
