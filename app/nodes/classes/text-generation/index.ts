import { buildDefaultPort, buildNodeClass } from "../../builder";
import { DefaultPortType, NodeClassCategory } from "../../type";
import { action } from "./action";

export const textGeneration = buildNodeClass("textGeneration", {
	categories: [NodeClassCategory.LLM],
	defaultPorts: {
		inputPorts: [
			buildDefaultPort({ type: DefaultPortType.Execution, name: "from" }),
			buildDefaultPort({ type: DefaultPortType.Data, name: "instruction" }),
		],
		outputPorts: [
			buildDefaultPort({ type: DefaultPortType.Execution, name: "to" }),
			buildDefaultPort({ type: DefaultPortType.Data, name: "result" }),
		],
	},
	action,
});
