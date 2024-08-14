import { object, string } from "valibot";
import { buildDefaultPort, buildNodeClass } from "../../builder";
import { DefaultPortType, NodeClassCategory } from "../../type";
import { resolver } from "./resolver";
import { Panel } from "./ui";

export const text = buildNodeClass("text", {
	categories: [NodeClassCategory.Utility],
	defaultPorts: {
		outputPorts: [
			buildDefaultPort({ type: DefaultPortType.Data, name: "text" }),
		],
	},
	dataSchema: object({
		content: string(),
	}),
	panel: Panel,
	resolver,
});
