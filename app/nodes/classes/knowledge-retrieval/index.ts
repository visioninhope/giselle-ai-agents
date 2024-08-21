import { buildDefaultPort, buildNodeClass } from "../../builder";
import { DefaultPortType, NodeClassCategory } from "../../type";
import { createOpenaiAssistant } from "./createOpenaiAssistant";
import { dataSchema } from "./data-schema";
import { retrieval } from "./retrieval";

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
	dataSchema,
	action: async ({
		data,
		node,
		knowledges,
		findDefaultInputPortAsBlueprint,
		requestId,
		findDefaultOutputPortAsBlueprint,
	}) => {
		await retrieval({
			node,
			openaiAssistantId: data.openaiAssistantId,
			knowledges: knowledges.filter((knowledge) =>
				data.knowledgeIds.includes(knowledge.id),
			),
			queryPortId: findDefaultInputPortAsBlueprint("query").id,
			requestId,
			resultPortId: findDefaultOutputPortAsBlueprint("result").id,
		});
	},
	afterCreate: async ({ node, dataSchema }) => {
		await createOpenaiAssistant({ node, dataSchema });
	},
});
