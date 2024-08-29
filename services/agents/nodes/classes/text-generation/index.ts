import { buildDefaultPort, buildNodeClass } from "../../builder";
import { nodeClassCategory, portType } from "../../type";
import { generateText } from "./generate-text";

export const textGeneration = buildNodeClass("textGeneration", {
	categories: [nodeClassCategory.llm],
	defaultPorts: {
		inputPorts: [
			buildDefaultPort({ type: portType.execution, name: "from" }),
			buildDefaultPort({ type: portType.data, name: "instruction" }),
		],
		outputPorts: [
			buildDefaultPort({ type: portType.execution, name: "to" }),
			buildDefaultPort({ type: portType.data, name: "result" }),
		],
	},
	action: async ({
		node,
		requestDbId: requestId,
		findDefaultTargetPort: findDefaultInputPortAsBlueprint,
		findDefaultSourceport: findDefaultOutputPortAsBlueprint,
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
