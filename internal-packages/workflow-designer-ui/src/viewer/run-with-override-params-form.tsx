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
		<div className="flex flex-col h-full">
			<div className="flex justify-between items-center mb-[24px]">
				<h2 className="font-accent text-[18px] font-bold text-primary-100 drop-shadow-[0_0_10px_#0087F6]">
					Override inputs to test workflow
				</h2>
			</div>
			<form
				className="flex-1 flex flex-col gap-[24px] relative text-white-800"
				onSubmit={handleSubmit}
			>
				<div className="flex flex-col gap-[16px] flex-1">
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
							<fieldset
								className="flex gap-[8px] w-full h-full"
								key={overrideNode.id}
							>
								<p className="w-[100px] text-[14px] font-bold text-white-400">
									{originalNode.name ?? "Plain Text"}
								</p>
								<TextEditor
									value={overrideNode.content.text}
									onValueChange={(value) => {
										setOverrideVariableNodes((prevOverrideVariableNodes) =>
											prevOverrideVariableNodes.map(
												(prevOverrideVariableNode) =>
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
				<div className="flex justify-end">
					<Button type="submit">Run with params</Button>
				</div>
			</form>
		</div>
	);
}
