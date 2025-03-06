import type { FileCategory, FileNode } from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { FileNodeIcon } from "../../../icons/node";
import {
	PropertiesPanelContent,
	PropertiesPanelHeader,
	PropertiesPanelRoot,
} from "../ui";
import { FilePanel, type FileTypeConfig } from "./file-panel";

const fileType: Record<FileCategory, FileTypeConfig> = {
	pdf: {
		accept: ["application/pdf"],
		fileTypeLabel: "PDF",
	},
	text: {
		accept: ["text/plain", "text/markdown"],
		fileTypeLabel: "Text",
	},
};

export function FileNodePropertiesPanel({ node }: { node: FileNode }) {
	const { updateNodeData } = useWorkflowDesigner();
	return (
		<PropertiesPanelRoot>
			<PropertiesPanelHeader
				icon={
					<FileNodeIcon node={node} className="size-[20px] text-black-900" />
				}
				name={node.name}
				onChangeName={(name) => {
					updateNodeData(node, { name });
				}}
			/>
			<PropertiesPanelContent>
				<FilePanel node={node} fileTypes={fileType[node.content.category]} />
			</PropertiesPanelContent>
		</PropertiesPanelRoot>
	);
}
