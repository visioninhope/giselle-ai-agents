import type { TextNode } from "@giselle-sdk/data-type";
import { TextEditor } from "@giselle-sdk/text-editor/react";
import { useFeatureFlag, useWorkflowDesigner } from "giselle-sdk/react";
import { PromptIcon } from "../../../icons";
import {
	PropertiesPanelContent,
	PropertiesPanelHeader,
	PropertiesPanelRoot,
	ResizableSection,
	ResizableSectionGroup,
} from "../ui";

export function TextNodePropertiesPanel({ node }: { node: TextNode }) {
	const { updateNodeDataContent, updateNodeData } = useWorkflowDesigner();
	const { layoutV2 } = useFeatureFlag();

	return (
		<PropertiesPanelRoot>
			<PropertiesPanelHeader
				icon={<PromptIcon className="size-[20px] text-black-900" />}
				node={node}
				description={"Plain Text"}
				onChangeName={(name) => {
					updateNodeData(node, { name });
				}}
			/>
			<PropertiesPanelContent>
				{layoutV2 ? (
					<ResizableSectionGroup>
						<ResizableSection title="Content" defaultSize={100}>
							<div className="p-4">
								<TextEditor
									value={node.content.text}
									onValueChange={(text) =>
										updateNodeDataContent(node, { text })
									}
								/>
							</div>
						</ResizableSection>
					</ResizableSectionGroup>
				) : (
					<TextEditor
						value={node.content.text}
						onValueChange={(text) => updateNodeDataContent(node, { text })}
					/>
				)}
			</PropertiesPanelContent>
		</PropertiesPanelRoot>
	);
}
