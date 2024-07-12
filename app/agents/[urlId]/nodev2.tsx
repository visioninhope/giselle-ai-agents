import type { RequestStepStatus } from "@/drizzle/schema";
import { cva } from "cva";
import { type FC, useMemo } from "react";
import { Handle, type NodeProps, Position } from "reactflow";
import invariant from "tiny-invariant";
import { match } from "ts-pattern";
import { type NodeStructureKey, nodeStructures } from "./node-list";
import type { InputPin } from "./strcture";

const nodeVariant = cva({
	base: "bg-card/50 border text-card-foreground min-w-[150px]",
	variants: {
		kind: {
			action: "rounded",
			context: "rounded-full",
		},
		runStatus: {
			idle: "border-border",
			running: " border-blue-500",
			success: "border-green-700",
			failed: "border-error",
		},
	},
	defaultVariants: {
		runStatus: "idle",
	},
});

const headerVariant = cva({
	base: "border-b border-border px-2 py-2",
});

const contentVariant = cva({
	base: "px-2 py-2",
});

const portVariant = cva({
	base: "flex items-center gap-2 h-4",
});

const handleVariant = cva({
	base: "!relative !w-[12px] !h-[12px] !top-[initial] !-translate-y-[0] !right-[initial] !left-[initial] !translate-x-[0] z-[1] group !cursor-default",
	variants: {
		kind: {
			execution: "!rounded-none",
			data: "!rounded-full",
		},
	},
});

export type NodeData = {
	structureKey: NodeStructureKey;
	label?: string;
	name?: string;
	inputs?: InputPin[];
	runStatus?: RequestStepStatus;
};
export const NodeV2: FC<NodeProps<NodeData>> = ({ data }) => {
	const nodeStructure = nodeStructures.find(
		(nodeStructure) => nodeStructure.key === data.structureKey,
	);
	invariant(
		nodeStructure != null,
		`${data.structureKey} Node structure not found`,
	);
	const inputs = useMemo(() => {
		const structuredInputs = match(nodeStructure)
			.with({ kind: "action" }, ({ inputs }) => inputs ?? [])
			.otherwise(() => []);
		return [...structuredInputs, ...(data.inputs ?? [])];
	}, [nodeStructure, data.inputs]);
	return (
		<div
			className={nodeVariant({
				kind: nodeStructure.kind,
				runStatus: data.runStatus,
			})}
		>
			{nodeStructure.kind === "action" && (
				<div className={headerVariant()}>
					{typeof nodeStructure.name === "function"
						? nodeStructure.name(data.name ?? "")
						: nodeStructure.name}
				</div>
			)}

			<div className={contentVariant()}>
				<div className="flex gap-8 items-start">
					{inputs.length > 0 && (
						<div className="flex flex-col gap-2 flex-1">
							{inputs?.map(({ key, label, kind }) => (
								<div className={portVariant()} key={key}>
									<Handle
										type="target"
										id={key}
										position={Position.Left}
										className={handleVariant({ kind })}
									/>
									<p className="whitespace-nowrap">
										{typeof label === "function"
											? label(data.label ?? "")
											: label}
									</p>
								</div>
							))}
						</div>
					)}
					<div className="flex flex-col gap-2 items-end flex-1">
						{nodeStructure.outputs?.map(({ key, label, kind }) => (
							<div className={portVariant()} key={key}>
								<p className="whitespace-nowrap">
									{typeof label === "function"
										? label(data.label ?? "")
										: label}
								</p>
								<Handle
									type="source"
									id={key}
									position={Position.Right}
									className={handleVariant({ kind })}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};
