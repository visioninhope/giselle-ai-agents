import type { ActionNode } from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { NodeIcon } from "../../../icons/node";
import { Button } from "../../../ui/button";
import {
	PropertiesPanelContent,
	PropertiesPanelHeader,
	PropertiesPanelRoot,
} from "../ui";
import { GitHubActionPropertiesPanel } from "./github-action-properties-panel";

export function ActionNodePropertiesPanel({
	node,
}: {
	node: ActionNode;
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
				action={
					node.content.command.state.status === "unconfigured" ? null : (
						<Button type="button">Action</Button>
					)
				}
			/>
			<PropertiesPanelContent>
				<PropertiesPanel node={node} />
			</PropertiesPanelContent>
		</PropertiesPanelRoot>
	);
}

function PropertiesPanel({
	node,
}: {
	node: ActionNode;
}) {
	switch (node.content.command.provider) {
		case "github":
			return <GitHubActionPropertiesPanel node={node} />;
		default: {
			const _exhaustiveCheck: never = node.content.command.provider;
			throw new Error(`Unhandled action provider: ${_exhaustiveCheck}`);
		}
	}
}
