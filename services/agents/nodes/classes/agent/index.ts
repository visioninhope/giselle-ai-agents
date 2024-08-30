import { literal, number, object, string } from "valibot";
import { agentSchema } from "../../../types";
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
		relevantAgent: agentSchema,
	}),
	action: async ({ requestDbId, nodeDbId, findDefaultSourceport, data }) => {
		await invokeAgent({
			requestDbId,
			nodeDbId,
			agent: data.relevantAgent,
			resultPort: findDefaultSourceport("result"),
		});
	},
});
