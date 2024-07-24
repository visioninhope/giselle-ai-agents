import type { RequestStepStatus, ports } from "@/drizzle/schema";
import {
	type Node,
	type NodeProps,
	NodeResizer,
	Position,
	Handle as XYFlowHandle,
	useNodeId,
	useUpdateNodeInternals,
} from "@xyflow/react";
import { cva } from "cva";
import { type ComponentProps, type FC, useEffect } from "react";

type NodeData = {
	id: string;
	className: string;
	inputPorts: (typeof ports.$inferSelect)[];
	outputPorts: (typeof ports.$inferSelect)[];
	stepStatus?: RequestStepStatus;
};
type NodeV3 = Node<NodeData>;
export const NodeV3: FC<NodeProps<NodeV3>> = ({
	selected,
	data: { className, inputPorts, outputPorts, stepStatus, id },
}) => {
	return (
		<>
			{selected && <NodeResizer minWidth={100} minHeight={30} />}
			<div
				className={nodeVariant({
					stepStatus,
				})}
			>
				<div className={headerVariant()}>
					<div>{className}</div>
				</div>
				<div className={contentVariant()}>
					<div className="flex gap-8 items-start">
						{inputPorts.length > 0 && (
							<div className="flex flex-col gap-2 flex-1">
								{inputPorts.map(({ id, name, type }) => (
									<div className={portVariant()} key={id}>
										<Handle
											type="target"
											id={`${id}`}
											position={Position.Left}
											className={handleVariant({ type })}
										/>
										<p className="whitespace-nowrap">{name}</p>
									</div>
								))}
							</div>
						)}
						<div className="flex flex-col gap-2 items-end flex-1">
							{outputPorts?.map(({ id, name, type }) => (
								<div className={portVariant()} key={id}>
									<p className="whitespace-nowrap">{name}</p>
									<Handle
										type="source"
										id={`${id}`}
										position={Position.Right}
										className={handleVariant({ type })}
									/>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

const Handle: FC<ComponentProps<typeof XYFlowHandle>> = (props) => {
	const nodeId = useNodeId();
	const updateNodeInternals = useUpdateNodeInternals();
	useEffect(() => {
		if (nodeId == null) {
			return;
		}
		updateNodeInternals(nodeId);
	}, [updateNodeInternals, nodeId]);
	return <XYFlowHandle {...props} />;
};
const nodeVariant = cva({
	base: "bg-card/50 border text-card-foreground min-w-[150px]",
	variants: {
		kind: {
			action: "rounded",
			context: "rounded-full",
		},
		stepStatus: {
			idle: "border-border",
			running: " border-blue-500",
			success: "border-green-700",
			failed: "border-error",
		},
	},
	defaultVariants: {
		stepStatus: "idle",
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
		type: {
			execution: "!rounded-none",
			data: "!rounded-full",
		},
	},
});
