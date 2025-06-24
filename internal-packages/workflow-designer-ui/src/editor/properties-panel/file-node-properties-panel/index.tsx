import type { FileCategory, FileNode } from "@giselle-sdk/data-type";
import { useFeatureFlag, useWorkflowDesigner } from "giselle-sdk/react";
import { FileNodeIcon } from "../../../icons/node";
import {
	PropertiesPanelContent,
	PropertiesPanelHeader,
	PropertiesPanelRoot,
	ResizableSection,
	ResizableSectionGroup,
} from "../ui";
import { FilePanel } from "./file-panel";
import type { FileTypeConfig } from "./file-panel-type";

const fileType: Record<FileCategory, FileTypeConfig> = {
	pdf: {
		accept: ["application/pdf"],
		label: "PDF",
	},
	text: {
		accept: ["text/plain", "text/markdown"],
		label: "Text",
	},
	image: {
		accept: ["image/png", "image/jpeg", "image/gif", "image/svg"],
		label: "Image",
		maxSize: 1024 * 1024,
	},
};

export function FileNodePropertiesPanel({ node }: { node: FileNode }) {
	const { updateNodeData } = useWorkflowDesigner();
	const { layoutV2 } = useFeatureFlag();

	return (
		<PropertiesPanelRoot>
			<PropertiesPanelHeader
				icon={
					<FileNodeIcon node={node} className="size-[20px] text-black-900" />
				}
				node={node}
				onChangeName={(name) => {
					updateNodeData(node, { name });
				}}
			/>
			<PropertiesPanelContent>
				{layoutV2 ? (
					<ResizableSectionGroup>
						<ResizableSection title="File Upload" defaultSize={100}>
							<div className="p-4">
								<FilePanel
									node={node}
									config={fileType[node.content.category]}
								/>
							</div>
						</ResizableSection>
					</ResizableSectionGroup>
				) : (
					<FilePanel node={node} config={fileType[node.content.category]} />
				)}
			</PropertiesPanelContent>
		</PropertiesPanelRoot>
	);
}
