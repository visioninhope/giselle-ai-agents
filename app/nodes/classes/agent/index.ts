import { number, object, string } from "valibot";
import { buildDefaultPort, buildNodeClass } from "../../builder";
import { DefaultPortType, NodeClassCategory } from "../../type";

export const agent = buildNodeClass("agent", {
	category: NodeClassCategory.Agent,
	defaultPorts: {
		inputPorts: [
			buildDefaultPort({ type: DefaultPortType.Execution, name: "from" }),
		],
		outputPorts: [
			buildDefaultPort({ type: DefaultPortType.Execution, name: "to" }),
		],
	},
	dataSchema: object({
		relevantAgent: object({
			id: number(),
			blueprintId: number(),
			name: string(),
		}),
	}),
});
