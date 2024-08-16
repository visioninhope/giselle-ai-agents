import { object, parse, string } from "valibot";
import { buildDefaultPort, buildNodeClass } from "../../builder";
import { DefaultPortType, NodeClassCategory } from "../../type";
import { buildTemplate } from "./build-template";
import { TextNodePanel } from "./ui";

export const text = buildNodeClass("text", {
	categories: [NodeClassCategory.Utility],
	defaultPorts: {
		outputPorts: [
			buildDefaultPort({ type: DefaultPortType.Data, name: "text" }),
		],
	},
	dataSchema: object({
		template: string(),
	}),
	renderPanel: ({ node, dataSchema }) => {
		const data = parse(dataSchema, node.data);
		return (
			<TextNodePanel
				node={node}
				textFieldValue={data.template}
				textFieldName="template"
			/>
		);
	},
	resolver: async ({
		requestId,
		node,
		dataSchema,
		findDefaultOutputPortAsBlueprint,
	}) => {
		const textPort = findDefaultOutputPortAsBlueprint("text");
		console.log(JSON.stringify(node.data));
		const data = parse(dataSchema, node.data);
		node.outputPorts.find(({ name }) => name === "text");
		await buildTemplate({
			requestId,
			nodeId: node.id,
			template: data.template,
			inputPorts: node.inputPorts,
			outputPortBlueprintId: textPort.portsBlueprintsId,
		});
	},
});
