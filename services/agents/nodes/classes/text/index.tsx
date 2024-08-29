import { object, parse, string } from "valibot";
import { buildDefaultPort, buildNodeClass } from "../../builder";
import { nodeClassCategory, portType } from "../../type";
import { buildTemplate } from "./build-template";
import { TextNodePanel } from "./ui";

export const text = buildNodeClass("text", {
	categories: [nodeClassCategory.utility],
	defaultPorts: {
		outputPorts: [buildDefaultPort({ type: portType.data, name: "text" })],
	},
	dataSchema: object({
		template: string(),
	}),
	renderPanel: ({ node, data }) => {
		return (
			<TextNodePanel
				node={node}
				textFieldValue={data.template}
				textFieldName="template"
			/>
		);
	},
	resolver: async ({
		requestDbId: requestId,
		node,
		data,
		findDefaultSourceport: findDefaultOutputPortAsBlueprint,
	}) => {
		const textPort = findDefaultOutputPortAsBlueprint("text");
		await buildTemplate({
			requestId,
			nodeId: node.id,
			template: data.template,
			inputPorts: node.inputPorts,
			outputPortId: textPort.id,
		});
	},
});
