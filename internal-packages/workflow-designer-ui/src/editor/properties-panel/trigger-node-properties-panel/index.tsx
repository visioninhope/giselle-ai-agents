import type { TriggerNode } from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { NodeIcon } from "../../../icons/node";
import {
	PropertiesPanelContent,
	PropertiesPanelHeader,
	PropertiesPanelRoot,
} from "../ui";

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
			<PropertiesPanelContent>todo</PropertiesPanelContent>
		</PropertiesPanelRoot>
	);
}
