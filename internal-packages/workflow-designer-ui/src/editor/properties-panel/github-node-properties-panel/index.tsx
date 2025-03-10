import type { GitHubNode } from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { GitHubIcon } from "../../../icons";
import {
	PropertiesPanelContent,
	PropertiesPanelHeader,
	PropertiesPanelRoot,
} from "../ui";
import { GitHubResourceLoader } from "./github-resource-loader";

export function GitHubNodePropertiesPanel({ node }: { node: GitHubNode }) {
	const { updateNodeDataContent, updateNodeData } = useWorkflowDesigner();

	return (
		<PropertiesPanelRoot>
			<PropertiesPanelHeader
				icon={<GitHubIcon className="size-[20px] text-black-900" />}
				name={node.name}
				fallbackName="GitHub"
				description={"GitHub"}
				onChangeName={(name) => {
					updateNodeData(node, { name });
				}}
			/>
			<PropertiesPanelContent>
				<GitHubResourceLoader />
			</PropertiesPanelContent>
		</PropertiesPanelRoot>
	);
}
