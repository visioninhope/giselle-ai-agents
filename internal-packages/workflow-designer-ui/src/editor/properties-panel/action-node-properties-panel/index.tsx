import type { ActionNode } from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { useCallback } from "react";
import { NodeIcon } from "../../../icons/node";
import { Button } from "../../../ui/button";
import {
	PropertiesPanelContent,
	PropertiesPanelHeader,
	PropertiesPanelRoot,
} from "../ui";
import { GitHubActionPropertiesPanel } from "./github-action-properties-panel";
import { useConnectedInputs } from "./lib";

export function ActionNodePropertiesPanel({
	node,
}: {
	node: ActionNode;
}) {
	const { updateNodeData, setUiNodeState } = useWorkflowDesigner();
	const { isValid } = useConnectedInputs(node.id, node.inputs);
	const handleClick = useCallback(() => {
		if (!isValid) {
			setUiNodeState(node.id, {
				showError: true,
			});
		}
	}, [isValid, setUiNodeState, node.id]);
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
						<Button type="button" onClick={handleClick}>
							Action
						</Button>
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
