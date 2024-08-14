import { buildDefaultPort, buildNodeClass } from "../../builder";
import { DefaultPortType, NodeClassCategory } from "../../type";

export const response = buildNodeClass("response", {
	categories: [NodeClassCategory.Response],
	defaultPorts: {
		inputPorts: [
			buildDefaultPort({ type: DefaultPortType.Execution, name: "from" }),
			buildDefaultPort({ type: DefaultPortType.Data, name: "output" }),
		],
	},
});
