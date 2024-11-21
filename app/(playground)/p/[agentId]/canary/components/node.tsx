import {
	Handle,
	type NodeProps,
	Position,
	type Node as XYFlowNode,
} from "@xyflow/react";
import clsx from "clsx/lite";
import React, { useMemo } from "react";
import { TextGenerationIcon } from "../../beta-proto/components/icons/text-generation";
import type { File, Text, TextGeneration, WebSearch } from "../types";

type TextNode = XYFlowNode<{ node: Text }>;
type FileNode = XYFlowNode<{ node: File }>;
type TextGenerationNode = XYFlowNode<{ node: TextGeneration }>;
type WebSearchNode = XYFlowNode<{ node: WebSearch }>;
export type Node = TextNode | FileNode | TextGenerationNode | WebSearchNode;

function NodeHeader({ name }: { name: string }) {
	return (
		<div className="flex items-center gap-[8px] px-[12px]">
			<div
				className={clsx(
					"w-[28px] h-[28px] flex items-center justify-center rounded-[4px] shadow-[1px_1px_12px_0px]",
					"group-data-[type=action]:bg-[hsla(187,71%,48%,1)] group-data-[type=action]shadow-[hsla(182,73%,52%,0.8)]",
					"group-data-[type=variable]:bg-white group-data-[type=variable]:shadow-[hsla(0,0%,93%,0.8)]",
				)}
			>
				<TextGenerationIcon className="w-[18px] h-[18px] fill-black-100" />
			</div>
			<div className="font-rosart text-[16px] text-black-30">{name}</div>
		</div>
	);
}

export function Node({
	data,
	preview = false,
}: NodeProps<Node> & { preview?: boolean }) {
	const targetHandles = useMemo(() => {
		if (data.node.content.type === "textGeneration") {
			return [
				data.node.content.requirement,
				...data.node.content.sources,
			].filter((item) => item !== undefined);
		}
		return [];
	}, [data.node]);
	return (
		<div
			data-type={data.node.type}
			data-preview={preview}
			className={clsx(
				"group relative rounded-[16px] bg-gradient-to-tl min-w-[180px] backdrop-blur-[1px] transition-shadow",
				"data-[type=action]:from-[hsla(187,79%,54%,0.2)] data-[type=action]:to-[hsla(207,100%,9%,0.2)]",
				"data-[type=variable]:from-[hsla(0,0%,91%,0.2)] data-[type=variable]:to-[hsla(0,0%,16%,0.2)]",
				"shadow-[0px_0px_16px_0px_hsla(187,_79%,_54%,_0.5)]",
				"data-[preview=true]:opacity-50",
			)}
		>
			<div
				className={clsx(
					"absolute z-0 rounded-[16px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent",
					"group-data-[type=action]:from-[hsla(187,79%,54%,1)] group-data-[type=action]:to-[hsla(187,68%,30%,1)]",
					"group-data-[type=variable]:from-[hsla(0,0%,91%,1)] group-data-[type=variable]:to-[hsla(0,0%,35%,1)]",
				)}
			/>
			{!preview && (
				<div className="absolute text-black-30 font-rosart text-[12px] -translate-y-full left-[8px] -top-[2px] flex items-center gap-[12px]">
					{/** props.isFinal && <span>Final</span>**/}
					{data.node.name}
				</div>
			)}
			<div
				className={clsx(
					"py-[12px] rounded-t-[16px]",
					"group-data-[type=action]:bg-[hsla(187,71%,48%,0.3)]",
					"group-data-[type=variable]:bg-[hsla(0,0%,93%,0.3)]",
				)}
			>
				{data.node.content.type === "textGeneration" && (
					<NodeHeader name="Text Generator" />
				)}
				{data.node.content.type === "text" && <NodeHeader name="Text" />}
				{data.node.content.type === "file" && <NodeHeader name="File" />}
			</div>
			<div className="py-[4px] min-h-[30px]">
				<div className="flex justify-between h-full">
					<div className="grid">
						{targetHandles.map((targetHandle) => (
							<div
								className="relative flex items-center h-[28px]"
								key={targetHandle.id}
							>
								<Handle
									type="target"
									position={Position.Left}
									id={targetHandle.id}
									className={clsx(
										"!absolute !w-[6px] !h-[12px] !rounded-l-[12px] !rounded-r-none !top-[50%] !-translate-y-[50%] !-left-[10px]",
										"group-data-[type=action]:!bg-[hsla(187,71%,48%,1)]",
										"group-data-[type=variable]:!bg-[hsla(236,7%,39%,1)]",
									)}
								/>
								<div className="text-[14px] text-black--30 px-[12px]">
									{targetHandle.label}
								</div>
							</div>
						))}
					</div>

					<div className="grid">
						<div className="relative flex items-center h-[28px]">
							<div className="absolute -right-[10px] translate-x-[6px]">
								<div
									className={clsx(
										"h-[28px] w-[10px]",
										"group-data-[type=action]:bg-[hsla(195,74%,21%,1)]",
										"group-data-[type=variable]:bg-[hsla(236,7%,39%,1)]",
									)}
								/>
								<Handle
									type="source"
									position={Position.Right}
									className={clsx(
										"!w-[12px] !absolute !h-[12px] !rounded-full !bg-black-100 !border-[2px] !top-[50%] !-translate-y-[50%] !translate-x-[5px]",
										"group-data-[type=action]:!border-[hsla(195,74%,21%,1)] group-data-[type=action]:data-[state=connected]:!bg-[hsla(187,71%,48%,1)] group-data-[type=action]:hover:!bg-[hsla(187,71%,48%,1)]",
										"group-data-[type=variable]:!border-[hsla(236,7%,39%,1)] group-data-[type=variable]:data-[state=connected]:!bg-white",
									)}
								/>
							</div>
							<div className="text-[14px] text-black--30 px-[12px]">Output</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
