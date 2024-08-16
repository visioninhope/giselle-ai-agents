import { buildDefaultPort, buildNodeClass } from "../../builder";
import { DefaultPortType, NodeClassCategory } from "../../type";
import { insertRequestResult } from "./insert-request-result";

export const response = buildNodeClass("response", {
	categories: [NodeClassCategory.Response],
	defaultPorts: {
		inputPorts: [
			buildDefaultPort({ type: DefaultPortType.Execution, name: "from" }),
			buildDefaultPort({ type: DefaultPortType.Data, name: "output" }),
		],
	},
	action: async ({ requestId, node }) => {
		await insertRequestResult({
			requestId,
			nodeId: node.id,
		});
	},
});
