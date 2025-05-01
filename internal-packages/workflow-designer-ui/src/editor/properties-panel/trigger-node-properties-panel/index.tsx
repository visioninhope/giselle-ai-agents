import {
	type TriggerNode,
	isTriggerProviderData,
} from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { NodeIcon } from "../../../icons/node";
import {
	PropertiesPanelContent,
	PropertiesPanelHeader,
	PropertiesPanelRoot,
} from "../ui";
import { GitHubTriggerPropertiesPanel } from "./github-trigger-properties-panel";

export function TriggerNodePropertiesPanel({
	node,
}: {
	node: TriggerNode;
}) {
	const { updateNodeData } = useWorkflowDesigner();
	return (
		<PropertiesPanelRoot>
			<PropertiesPanelHeader
				icon={<NodeIcon node={node} className="size-[20px] text-black-900" />}
				node={node}
				onChangeName={(name) => {
					updateNodeData(node, { name });
				}}
			/>
			<PropertiesPanelContent>
				<PropertiesPnael node={node} />
			</PropertiesPanelContent>
		</PropertiesPanelRoot>
	);
}
function PropertiesPnael({
	node,
}: {
	node: TriggerNode;
}) {
	if (!isTriggerProviderData(node.content.source)) {
		return null;
	}
	switch (node.content.source.provider) {
		case "github":
			return <GitHubTriggerPropertiesPanel node={node} />;
		case "manual":
			return "manual";
		default: {
			const _exhaustiveCheck: never = node.content.source;
			throw new Error(`Unhandled action: ${_exhaustiveCheck}`);
		}
	}
}
