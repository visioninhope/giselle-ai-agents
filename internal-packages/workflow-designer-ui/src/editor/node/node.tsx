import {
	type ConnectionHandle,
	FileNode,
	type Node,
	TextGenerationNode,
	TextNode,
} from "@giselle-sdk/data-type";
import {
	Handle,
	type NodeProps,
	type NodeTypes,
	Position,
	type Node as XYFlowNode,
} from "@xyflow/react";
import clsx from "clsx/lite";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { Icon } from "lucide-react";
import { useMemo } from "react";
import { ContentTypeIcon, type ContentTypeIconProps } from "../../icons";
import { NodeNameEditable } from "./node-name-editable";

type GiselleWorkflowDesignerTextGenerationNode = XYFlowNode<
	{ nodeData: TextGenerationNode; preview?: boolean },
	TextGenerationNode["content"]["type"]
>;
type GiselleWorkflowDesignerTextNode = XYFlowNode<
	{ nodeData: TextNode; preview?: boolean },
	TextNode["content"]["type"]
>;
type GiselleWorkflowDesignerFileNode = XYFlowNode<
	{ nodeData: FileNode; preview?: boolean },
	FileNode["content"]["type"]
>;
export type GiselleWorkflowDesignerNode =
	| GiselleWorkflowDesignerTextGenerationNode
	| GiselleWorkflowDesignerTextNode
	| GiselleWorkflowDesignerFileNode;

export const nodeTypes: NodeTypes = {
	[TextGenerationNode.shape.content.shape.type._def.value]: CustomXyFlowNode,
	[TextNode.shape.content.shape.type._def.value]: CustomXyFlowNode,
	[FileNode.shape.content.shape.type._def.value]: CustomXyFlowNode,
};

export function CustomXyFlowNode({
	data,
	selected,
}: NodeProps<GiselleWorkflowDesignerNode>) {
	const { data: workspace, updateNodeData } = useWorkflowDesigner();
	const targetHandles = useMemo(() => {
		if (data.nodeData.content.type !== "textGeneration") {
			return [];
		}
		return [...data.nodeData.content.inputs].filter(
			(item) => item !== undefined,
		);
	}, [data]);
	const hasTarget = useMemo(
		() =>
			workspace.connections.some(
				(connection) => connection.sourceNodeId === data.nodeData.id,
			),
		[workspace, data.nodeData.id],
	);

	switch (data.nodeData.content.type) {
		case "textGeneration":
			return (
				<NodeComponent
					nodeType={data.nodeData.type}
					title={data.nodeData.name ?? data.nodeData.content.llm.model}
					subtitle={data.nodeData.content.llm.provider}
					selected={selected}
					hasTarget={hasTarget}
					targetHandles={targetHandles}
					contentType="textGeneration"
					llmProvider={data.nodeData.content.llm.provider}
				/>
			);
		case "file":
			return (
				<NodeComponent
					nodeType={data.nodeData.type}
					title={data.nodeData.name}
					selected={selected}
					hasTarget={hasTarget}
					targetHandles={targetHandles}
					contentType="file"
					fileCategory={data.nodeData.content.category}
				/>
			);
		case "text":
			return (
				<NodeComponent
					nodeType={data.nodeData.type}
					title={data.nodeData.name}
					selected={selected}
					hasTarget={hasTarget}
					targetHandles={targetHandles}
					contentType="text"
				/>
			);
		default: {
			const _exhaustiveCheck: never = data.nodeData.content;
			throw new Error(`Unhandled content type: ${_exhaustiveCheck}`);
		}
	}
}

export function NodeComponent({
	nodeType,
	selected,
	targetHandles,
	title,
	subtitle,
	preview = false,
	hasTarget = false,
	...iconProps
}: {
	title?: string;
	subtitle?: string;
	nodeType: Node["type"];
	targetHandles?: ConnectionHandle[];
	selected?: boolean;
	preview?: boolean;
	hasTarget?: boolean;
} & ContentTypeIconProps) {
	return (
		<div
			data-type={nodeType}
			data-content-type={iconProps.contentType}
			data-selected={selected}
			data-preview={preview}
			className={clsx(
				"group relative flex flex-col rounded-[16px] py-[16px] gap-[16px] min-w-[180px]",
				"bg-gradient-to-tl transition-shadow backdrop-blur-[4px]",
				"data-[content-type=text]:from-text-node-1] data-[content-type=text]:to-text-node-2 data-[content-type=text]:shadow-text-node-1",
				"data-[content-type=file]:from-file-node-1] data-[content-type=file]:to-file-node-2 data-[content-type=file]:shadow-file-node-1",
				"data-[content-type=textGeneration]:from-generation-node-1] data-[content-type=textGeneration]:to-generation-node-2 data-[content-type=textGeneration]:shadow-generation-node-1",
				"data-[selected=true]:shadow-[0px_0px_16px_0px]",
				"data-[preview=true]:opacity-50",
				"not-data-preview:min-h-[110px]",
			)}
		>
			<div
				className={clsx(
					"absolute z-0 rounded-[16px] inset-0 border-[1.5px] mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent",
					"group-data-[content-type=text]:from-text-node-1/40 group-data-[content-type=text]:to-text-node-1",
					"group-data-[content-type=file]:from-file-node-1/40 group-data-[content-type=file]:to-file-node-1",
					"group-data-[content-type=textGeneration]:from-generation-node-1/40 group-data-[content-type=textGeneration]:to-generation-node-1",
				)}
			/>

			{/* <NodeNameEditable
				name={data.nodeData.name}
				onNodeNameChange={(name) => {
					updateNodeData(data.nodeData, { name });
				}}
			/> */}
			<div className={clsx("px-[16px]")}>
				<div className="flex items-center gap-[8px]">
					<div
						className={clsx(
							"w-[32px] h-[32px] flex items-center justify-center rounded-[8px] padding-[8px]",
							"group-data-[content-type=text]:bg-text-node-1",
							"group-data-[content-type=file]:bg-file-node-1",
							"group-data-[content-type=textGeneration]:bg-generation-node-1",
						)}
					>
						<ContentTypeIcon
							{...iconProps}
							className={clsx(
								"w-[16px] h-[16px] fill-current",
								"group-data-[content-type=text]:text-black",
								"group-data-[content-type=file]:text-black",
								"group-data-[content-type=textGeneration]:text-white",
							)}
						/>
					</div>
					<div>
						<div className="font-rosart text-[14px] text-white">
							{title ?? "Unnamed node"}
						</div>
						{subtitle && (
							<div className="text-[10px] text-white-50">{subtitle}</div>
						)}
					</div>
				</div>
			</div>
			{!preview && (
				<div className="flex justify-between">
					<div className="grid">
						{targetHandles?.map((targetHandle) => (
							<div
								className="relative flex items-center h-[28px]"
								key={targetHandle.id}
							>
								<Handle
									type="target"
									position={Position.Left}
									id={targetHandle.id}
									className={clsx(
										"!absolute !w-[11px] !h-[11px] !rounded-full !-left-[5px] !translate-x-[50%] !border-[1.5px]",
										"group-data-[content-type=textGeneration]:!bg-generation-node-1 group-data-[content-type=textGeneration]:!border-generation-node-1",
									)}
								/>
								<div className="text-[14px] text-black--30 px-[12px] text-white">
									{targetHandle.label}
								</div>
							</div>
						))}
					</div>

					<div className="grid">
						<div className="relative flex items-center h-[28px]">
							<Handle
								type="source"
								position={Position.Right}
								data-state={hasTarget ? "connected" : "disconnected"}
								className={clsx(
									"!absolute !w-[12px] !h-[12px] !rounded-full !border-[1.5px]",
									"group-data-[content-type=textGeneration]:!border-generation-node-1",
									"group-data-[content-type=text]:!border-text-node-1",
									"group-data-[content-type=file]:!border-file-node-1",
									"data-[state=connected]:group-data-[content-type=textGeneration]:!bg-generation-node-1",
									"data-[state=connected]:group-data-[content-type=text]:!bg-text-node-1 data-[state=connected]:group-data-[content-type=text]:!border-text-node-1",
									"data-[state=disconnected]:!bg-black",
								)}
							/>
							<div className="text-[14px] px-[16px] text-white">Output</div>
						</div>
					</div>
				</div>
			)}
			{/* <div className="py-[4px] min-h-[30px]">
				<div className="flex justify-between h-full"> */}
			{/* </div>
			</div> */}
		</div>
	);
}
