import { number, object, string } from "valibot";
import { buildDefaultPort, buildNodeClass } from "../../builder";
import { nodeClassCategory, portType } from "../../type";
import { invokeAgent } from "./invoke-agent";

export const agent = buildNodeClass("agent", {
	categories: [nodeClassCategory.llm],
	defaultPorts: {
		inputPorts: [buildDefaultPort({ type: portType.execution, name: "from" })],
		outputPorts: [
			buildDefaultPort({ type: portType.execution, name: "to" }),
			buildDefaultPort({ type: portType.data, name: "result" }),
		],
	},
	dataSchema: object({
		relevantAgent: object({
			id: number(),
			blueprintId: number(),
			name: string(),
		}),
	}),
	action: async ({
		requestDbId: requestId,
		nodeGraph: node,
		data,
		findDefaultSourceport: findDefaultOutputPortAsBlueprint,
	}) => {
		await invokeAgent();
		// await invokeAgent({
		// 	requestId,
		// 	node,
		// 	resultPortId: findDefaultOutputPortAsBlueprint("result").id,
		// 	relevantAgent: {
		// 		id: data.relevantAgent.id,
		// 		blueprintId: data.relevantAgent.blueprintId,
		// 	},
		// });
	},
});
