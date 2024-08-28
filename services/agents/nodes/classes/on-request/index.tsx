import { buildDefaultPort, buildNodeClass } from "../../builder";
import { nodeClassCategory, portType } from "../../type";
import { OnRequestNodePanel } from "./ui";

export const onRequest = buildNodeClass("onRequest", {
	categories: [nodeClassCategory.trigger],
	defaultPorts: {
		outputPorts: [buildDefaultPort({ type: portType.execution, name: "to" })],
	},
	renderPanel: ({ node }) => <OnRequestNodePanel node={node} />,
});
