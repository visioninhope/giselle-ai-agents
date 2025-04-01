import {
	type OverrideVariableNode,
	type Workflow,
	isOverrideTextContent,
	isTextNode,
} from "@giselle-sdk/data-type";
import { TextEditor } from "@giselle-sdk/text-editor/react-internal";
import { useState } from "react";
import { Button } from "../ui/button";

export function RunWithOverrideParamsForm({ flow }: { flow: Workflow }) {
	const [overrideVariableNodes, setOverrideVariableNodes] = useState<
		OverrideVariableNode[]
	>(
		flow.nodes
			.map((node) =>
				isTextNode(node)
					? ({
							id: node.id,
							type: "variable",
							content: {
								type: "text",
								text: node.content.text,
							},
						} satisfies OverrideVariableNode)
					: null,
			)
			.filter((node) => node !== null),
	);
	return (
		<div className="flex flex-col gap-[24px] relative text-white-800">
			<p className="font-accent text-[16px] font-bold text-white-400">
				Run app with override parameters
			</p>
			<div className="flex flex-col gap-[16px]">
				{overrideVariableNodes?.map((overrideNode) => {
					if (!isOverrideTextContent(overrideNode.content)) {
						return null;
					}
					const originalNode = flow.nodes.find(
						(node) => node.id === overrideNode.id,
					);
					if (originalNode === undefined) {
						return null;
					}
					return (
						<fieldset className="flex gap-[8px] w-full" key={overrideNode.id}>
							<p className="w-[100px] text-[14px] font-bold text-white-400">
								{originalNode.name ?? "Plain text"}
							</p>
							<TextEditor
								value={overrideNode.content.text}
								onValueChange={(value) => {
									setOverrideVariableNodes((prevOverrideVariableNodes) =>
										prevOverrideVariableNodes.map((prevOverrideVariableNode) =>
											prevOverrideVariableNode.id === overrideNode.id
												? {
														id: prevOverrideVariableNode.id,
														type: prevOverrideVariableNode.type,
														content: {
															type: "text",
															text: value,
														},
													}
												: prevOverrideVariableNode,
										),
									);
								}}
							/>
						</fieldset>
					);
				})}
			</div>
			<Button type="button">Run with params</Button>
		</div>
	);
}
