import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cva } from "cva";
import { type FC, type ReactNode, useMemo } from "react";
import { Handle, type NodeProps, Position } from "reactflow";
import { NodeV2 } from "./nodev2";
import { NodeV3 } from "./nodev3";

const nodeVariant = cva({
	base: "bg-card/50 border border-border rounded text-card-foreground min-w-[150px]",
});

const headerVariant = cva({
	base: "border-b border-border px-2 py-2",
});

const contentVariant = cva({
	base: "px-2 py-2",
});

const portVariant = cva({
	base: "flex items-center gap-2",
});

const handleVariant = cva({
	base: "!relative !w-[12px] !h-[12px] !top-[initial] !-translate-y-[0] !right-[initial] !left-[initial] !translate-x-[0] z-[1] group !cursor-default",
	variants: {
		type: {
			exec: "!rounded-none",
			param: "!rounded-full",
		},
	},
	defaultVariants: {
		type: "param",
	},
});

const NodeContainer: FC<{ title: string; children: ReactNode }> = ({
	title,
	children,
}) => (
	<div className={nodeVariant()}>
		<div className={headerVariant()}>{title}</div>
		<div className={contentVariant()}>{children}</div>
	</div>
);

const LoopNode: FC<NodeProps> = () => {
	return (
		<NodeContainer title="Loop">
			<div className="flex gap-8 items-start w-full justify-between mb-2">
				<div className={portVariant()}>
					<Handle
						type="target"
						id="target"
						position={Position.Left}
						className={handleVariant({ type: "exec" })}
					/>
				</div>
				<div className={portVariant()}>
					<Handle
						type="source"
						id="source"
						position={Position.Right}
						className={handleVariant({ type: "exec" })}
					/>
				</div>
			</div>
			<div className="flex gap-8 items-start">
				<div className="flex flex-col gap-2">
					<div className={portVariant()}>
						<Handle
							type="target"
							id="array"
							position={Position.Left}
							className={handleVariant()}
						/>
						<p>Array</p>
					</div>
				</div>
				<div className="flex flex-col gap-1 items-end">
					<div className={portVariant()}>
						<p>Array Element</p>
						<Handle
							type="source"
							id="arrayElement"
							position={Position.Right}
							className={handleVariant()}
						/>
					</div>
					<div className={portVariant()}>
						<p>Completed</p>
						<Handle
							type="source"
							id="completed"
							position={Position.Right}
							className={handleVariant({ type: "exec" })}
						/>
					</div>
				</div>
			</div>
		</NodeContainer>
	);
};

const GetContextNode: FC<NodeProps> = () => {
	return (
		<NodeContainer title="GetContext">
			<div className="flex flex-col gap-2">
				<Label>Key</Label>
				<Select>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="Select the Key" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="Input Resources">Input Resources</SelectItem>
						<SelectItem value="Theme">Theme</SelectItem>
						<SelectItem value="Loaded Resources">Loaded Resources</SelectItem>
						<SelectItem value="Format">Format</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="flex justify-end mt-4">
				<div className={portVariant()}>
					<p>Return Value</p>
					<Handle
						type="source"
						id="returnValue"
						position={Position.Right}
						className={handleVariant()}
					/>
				</div>
			</div>
		</NodeContainer>
	);
};

const SetContextNode: FC<NodeProps> = () => {
	return (
		<NodeContainer title="SetContext">
			<div className="flex gap-8 items-start w-full justify-between mb-2">
				<div className={portVariant()}>
					<Handle
						type="target"
						id="target"
						position={Position.Left}
						className={handleVariant({ type: "exec" })}
					/>
				</div>
				<div className={portVariant()}>
					<Handle
						type="source"
						id="source"
						position={Position.Right}
						className={handleVariant({ type: "exec" })}
					/>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<div className="flex flex-col gap-2">
					<Label>Key</Label>
					<Select>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select the Key" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="Input Resources">Input Resources</SelectItem>
							<SelectItem value="Theme">Theme</SelectItem>
							<SelectItem value="Loaded Resources">Loaded Resources</SelectItem>
							<SelectItem value="Format">Format</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className={portVariant()}>
					<Handle
						type="target"
						id="value"
						position={Position.Left}
						className={handleVariant()}
					/>
					<p>Value</p>
				</div>
			</div>
		</NodeContainer>
	);
};

const LoaderNode: FC<NodeProps> = () => {
	return (
		<NodeContainer title="Loader">
			<div className="flex gap-8 items-start w-full justify-between mb-2">
				<div className={portVariant()}>
					<Handle
						id="target"
						type="target"
						position={Position.Left}
						className={handleVariant({ type: "exec" })}
					/>
				</div>
				<div className={portVariant()}>
					<Handle
						id="source"
						type="source"
						position={Position.Right}
						className={handleVariant({ type: "exec" })}
					/>
				</div>
			</div>
			<div className="flex gap-8">
				<div className={portVariant()}>
					<Handle
						type="target"
						id="loader"
						position={Position.Left}
						className={handleVariant()}
					/>
					<p>Loader</p>
				</div>
				<div className={portVariant()}>
					<p>Return Value</p>
					<Handle
						type="source"
						id="returnValue"
						position={Position.Right}
						className={handleVariant()}
					/>
				</div>
			</div>
		</NodeContainer>
	);
};

type TextGenerationNodeData = {
	params?: { name: string }[];
};
const TextGenerationNode: FC<NodeProps<TextGenerationNodeData>> = ({
	data,
}) => {
	return (
		<NodeContainer title="Text Generation">
			<div className="flex gap-8 items-start w-full justify-between mb-2">
				<div className={portVariant()}>
					<Handle
						id="target"
						type="target"
						position={Position.Left}
						className={handleVariant({ type: "exec" })}
					/>
				</div>
				<div className={portVariant()}>
					<Handle
						id="source"
						type="source"
						position={Position.Right}
						className={handleVariant({ type: "exec" })}
					/>
				</div>
			</div>
			<div className="flex gap-8">
				<div className="flex flex-col gap-1">
					{data.params?.map(({ name }) => (
						<div className={portVariant()} key={name}>
							<Handle
								type="target"
								id={name}
								position={Position.Left}
								className={handleVariant()}
							/>
							<p>{name}</p>
						</div>
					))}
				</div>
				<div className={portVariant()}>
					<p>Return Value</p>
					<Handle
						type="source"
						id="returnValue"
						position={Position.Right}
						className={handleVariant()}
					/>
				</div>
			</div>
		</NodeContainer>
	);
};

const TextGenerationResultToTextNode: FC<NodeProps> = () => {
	return (
		<NodeContainer title="Text Generation Result to Text">
			<div className="flex gap-8 items-start w-full justify-between mb-2">
				<div className={portVariant()}>
					<Handle
						id="target"
						type="target"
						position={Position.Left}
						className={handleVariant({ type: "exec" })}
					/>
				</div>
				<div className={portVariant()}>
					<Handle
						id="source"
						type="source"
						position={Position.Right}
						className={handleVariant({ type: "exec" })}
					/>
				</div>
			</div>
			<div className="flex gap-8 justify-between">
				<div className={portVariant()}>
					<Handle
						type="target"
						id="value"
						position={Position.Left}
						className={handleVariant()}
					/>
					<p>Value</p>
				</div>
				<div className={portVariant()}>
					<p>Return Value</p>
					<Handle
						type="source"
						id="returnValue"
						position={Position.Right}
						className={handleVariant()}
					/>
				</div>
			</div>
		</NodeContainer>
	);
};

export const NodeTypes = {
	Loop: "loop",
	GetContext: "getContext",
	Loader: "loader",
	SetContext: "setContext",
	TextGeneration: "textGeneration",
	TextGenerationResultToText: "textGenerationResultToText",
	V2: "v2",
	V3: "v3",
} as const;

export const useNodeTypes = () =>
	useMemo(
		() => ({
			[NodeTypes.Loop]: LoopNode,
			[NodeTypes.GetContext]: GetContextNode,
			[NodeTypes.Loader]: LoaderNode,
			[NodeTypes.SetContext]: SetContextNode,
			[NodeTypes.TextGeneration]: TextGenerationNode,
			[NodeTypes.TextGenerationResultToText]: TextGenerationResultToTextNode,
			[NodeTypes.V2]: NodeV2,
			[NodeTypes.V3]: NodeV3,
		}),
		[],
	);
