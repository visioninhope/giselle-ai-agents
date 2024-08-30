import { object } from "valibot";
import { agentSchema } from "../../../types";
import { buildDefaultPort, buildNodeClass } from "../../builder";
import { nodeClassCategory, portType } from "../../types";
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
		relevantAgent: agentSchema,
	}),
	action: async ({ requestDbId, findDefaultSourceport, data }) => {
		await invokeAgent({
			requestDbId,
			agent: data.relevantAgent,
			resultPort: findDefaultSourceport("result"),
		});
	},
});
