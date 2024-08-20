import { array, nullable, number, object, string } from "valibot";
import { buildDefaultPort, buildNodeClass } from "../../builder";
import { DefaultPortType, NodeClassCategory } from "../../type";

export const knowledgeRetrieval = buildNodeClass("knowledgeRetrieval", {
	categories: [NodeClassCategory.LLM],
	defaultPorts: {
		inputPorts: [
			buildDefaultPort({ type: DefaultPortType.Execution, name: "from" }),
			buildDefaultPort({ type: DefaultPortType.Data, name: "query" }),
		],
		outputPorts: [
			buildDefaultPort({ type: DefaultPortType.Execution, name: "to" }),
			buildDefaultPort({ type: DefaultPortType.Data, name: "result" }),
		],
	},
	dataSchema: object({
		openAiAssistantId: string(),
		knowledgeIds: array(number()),
	}),
	action: async ({ data, node }) => {},
});
