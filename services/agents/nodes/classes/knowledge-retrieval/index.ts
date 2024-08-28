import { buildDefaultPort, buildNodeClass } from "../../builder";
import { nodeClassCategory, portType } from "../../type";
import { createOpenaiAssistant } from "./createOpenaiAssistant";
import { dataSchema } from "./data-schema";
import { retrieval } from "./retrieval";

export const knowledgeRetrieval = buildNodeClass("knowledgeRetrieval", {
	categories: [nodeClassCategory.llm],
	defaultPorts: {
		inputPorts: [
			buildDefaultPort({ type: portType.execution, name: "from" }),
			buildDefaultPort({ type: portType.data, name: "query" }),
		],
		outputPorts: [
			buildDefaultPort({ type: portType.execution, name: "to" }),
			buildDefaultPort({ type: portType.data, name: "result" }),
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
