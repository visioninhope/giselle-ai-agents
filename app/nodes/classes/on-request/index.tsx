import { buildDefaultPort, buildNodeClass } from "../../builder";
import { DefaultPortType, NodeClassCategory } from "../../type";
import { OnRequestNodePanel } from "./ui";

export const onRequest = buildNodeClass("onRequest", {
	categories: [NodeClassCategory.Trigger],
	defaultPorts: {
		outputPorts: [
			buildDefaultPort({ type: DefaultPortType.Execution, name: "to" }),
		],
	},
	renderPanel: ({ node }) => <OnRequestNodePanel node={node} />,
});
