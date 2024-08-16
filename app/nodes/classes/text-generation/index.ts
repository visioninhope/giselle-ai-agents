import { buildDefaultPort, buildNodeClass } from "../../builder";
import { DefaultPortType, NodeClassCategory } from "../../type";
import { generateText } from "./generate-text";

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
	action: async ({
		node,
		requestId,
		findDefaultInputPortAsBlueprint,
		findDefaultOutputPortAsBlueprint,
	}) => {
		const instructionPort = findDefaultInputPortAsBlueprint("instruction");
		const resultPort = findDefaultOutputPortAsBlueprint("result");
		await generateText({
			instructionPortId: instructionPort.id,
			resultPortId: resultPort.id,
			nodeId: node.id,
			requestId,
		});
	},
});
