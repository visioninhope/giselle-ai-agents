import {
	type OverrideVariableNode,
	type Workflow,
	isOverrideTextContent,
	isTextNode,
} from "@giselle-sdk/data-type";
import { TextEditor } from "@giselle-sdk/text-editor/react-internal";
import { useRunController } from "giselle-sdk/react";
import { type FormEventHandler, useCallback, useState } from "react";
import { Button } from "../ui/button";

export function RunWithOverrideParamsForm({ flow }: { flow: Workflow }) {
	const { perform } = useRunController();
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
	const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
		(e) => {
			e.preventDefault();
			perform(flow.id, {
				overrideNodes: overrideVariableNodes,
			});
		},
		[flow.id, perform, overrideVariableNodes],
	);
	return (
		<form
			className="flex flex-col gap-[24px] relative text-white-800"
			onSubmit={handleSubmit}
		>
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
			<Button type="submit">Run with params</Button>
		</form>
	);
}
