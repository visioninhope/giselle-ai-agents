import { Button } from "@giselle-internal/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@giselle-internal/ui/dialog";
import { DropdownMenu } from "@giselle-internal/ui/dropdown-menu";
import { useToasts } from "@giselle-internal/ui/toast";
import {
	type ConnectionId,
	isTriggerNode,
	type NodeId,
} from "@giselle-sdk/data-type";
import {
	defaultName,
	useActController,
	useNodeGroups,
	useWorkflowDesigner,
} from "@giselle-sdk/giselle/react";
import clsx from "clsx/lite";
import { PlayIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { NodeIcon } from "../../../icons/node";
import { TriggerInputDialog } from "./trigger-input-dialog";

function DropdownMenuItem({
	icon,
	title,
	subtitle,
	className,
	...props
}: {
	icon: React.ReactNode;
	title: string;
	subtitle: string;
} & React.DetailedHTMLProps<
	React.ButtonHTMLAttributes<HTMLButtonElement>,
	HTMLButtonElement
>) {
	return (
		<button
			className={clsx(
				"flex items-center py-[8px] px-[12px] gap-[10px] w-full outline-none cursor-pointer hover:bg-ghost-element-hover rounded-[6px]",
				className,
			)}
			{...props}
		>
			<div className="p-[12px] bg-black-800 rounded-[8px]">{icon}</div>
			<div className="flex flex-col gap-[0px] text-white-900 items-start">
				<div className="text-[13px]">{title}</div>
				<div className="text-[12px] text-white-400">{subtitle}</div>
			</div>
		</button>
	);
}

export function RunButton() {
	const { data, setUiNodeState } = useWorkflowDesigner();
	const { createAndStartAct } = useActController();

	const [openDialogNodeId, setOpenDialogNodeId] = useState<string | null>(null);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const nodeGroups = useNodeGroups();
	const { runGroups, singleRunItem } = useMemo(() => {
		const triggerNodeItems = nodeGroups.triggerNodeGroups.map(
			(triggerNodeGroup) =>
				({
					type: "triggerNode",
					value: triggerNodeGroup.node.id,
					label:
						triggerNodeGroup.node.name ?? defaultName(triggerNodeGroup.node),
					node: triggerNodeGroup.node,
					nodeIds: triggerNodeGroup.nodeGroup.nodeIds,
					connectionIds: triggerNodeGroup.nodeGroup.connectionIds,
					index: undefined,
				}) as const,
		);
		const operationNodeItems = nodeGroups.operationNodeGroups.map(
			(operationNodeGroup, index) =>
				({
					type: "nodeGroup",
					value: `operation-node-index-${index}`,
					label: `Group ${index + 1}`,
					node: undefined,
					nodeIds: operationNodeGroup.nodeIds,
					connectionIds: operationNodeGroup.connectionIds,
					index,
				}) as const,
		);

		const runGroups = [];
		if (triggerNodeItems.length > 0) {
			runGroups.push({
				groupId: "triggerNodes",
				groupLabel: "Trigger Nodes",
				items: triggerNodeItems,
			});
		}
		if (operationNodeItems.length > 0) {
			runGroups.push({
				groupId: "operationNodes",
				groupLabel: "Node Group",
				items: operationNodeItems,
			});
		}
		const runItems = [...triggerNodeItems, ...operationNodeItems];
		return {
			singleRunItem: runItems.length === 1 ? runItems[0] : undefined,
			runGroups,
		};
	}, [nodeGroups]);

	const { info } = useToasts();

	const startAct = async (item: {
		nodeIds: NodeId[];
		connectionIds: ConnectionId[];
	}) => {
		for (const nodeId of item.nodeIds) {
			setUiNodeState(nodeId, { highlighted: false });
		}
		await createAndStartAct({
			connectionIds: item.connectionIds,
			inputs: [],
			onActStart(cancel) {
				info("Workflow submitted successfully", {
					action: {
						label: "Cancel",
						onClick: async () => {
							await cancel();
						},
					},
				});
			},
		});
	};

	if (singleRunItem !== undefined) {
		switch (singleRunItem.type) {
			case "nodeGroup":
				return (
					<Button
						leftIcon={<PlayIcon className="size-[15px] fill-current" />}
						variant="glass"
						size="large"
						onClick={() => startAct(singleRunItem)}
					>
						Run
					</Button>
				);
			case "triggerNode":
				return (
					<Dialog
						open={openDialogNodeId === singleRunItem.node.id}
						onOpenChange={(isOpen) => {
							setOpenDialogNodeId(
								isOpen && singleRunItem.node ? singleRunItem.node.id : null,
							);
						}}
					>
						<DialogTrigger asChild>
							<Button
								leftIcon={<PlayIcon className="size-[15px] fill-current" />}
								variant="glass"
								size="large"
							>
								Run
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogTitle className="sr-only">
								Override inputs to test workflow
							</DialogTitle>
							<TriggerInputDialog
								node={singleRunItem.node}
								connectionIds={singleRunItem.connectionIds}
								onClose={() => {
									setOpenDialogNodeId(null);
								}}
							/>
						</DialogContent>
					</Dialog>
				);
			default: {
				const _exhaustiveCheck: never = singleRunItem;
				throw new Error(`Unhandled type: ${_exhaustiveCheck}`);
			}
		}
	}

	// Multiple items: use dropdown behavior
	return (
		<DropdownMenu
			open={isDropdownOpen}
			onOpenChange={setIsDropdownOpen}
			onSelect={async (_event, item) => {
				await startAct(item);
			}}
			onItemHover={(item, isHovered) => {
				const itemData = item;
				for (const node of data.nodes) {
					if (!itemData.nodeIds.includes(node.id)) {
						continue;
					}
					setUiNodeState(node.id, { highlighted: isHovered });
				}
			}}
			items={runGroups}
			renderItemAsChild
			renderItem={(item, props) => {
				const itemData = item;
				const startingNode = itemData.node;
				if (startingNode === undefined || !isTriggerNode(startingNode)) {
					return (
						<DropdownMenuItem
							icon={<div className="bg-ghost-element-background size-[16px]" />}
							title={itemData.label}
							subtitle={String(itemData.value)}
						/>
					);
				}
				return (
					<Dialog
						open={openDialogNodeId === startingNode.id}
						onOpenChange={(isOpen) => {
							setOpenDialogNodeId(isOpen ? startingNode.id : null);
							if (!isOpen) {
								setIsDropdownOpen(false);
							}
						}}
					>
						<DialogTrigger asChild>
							<DropdownMenuItem
								icon={
									<NodeIcon
										node={startingNode}
										className="size-[16px] text-white-900"
									/>
								}
								title={startingNode.name ?? defaultName(startingNode)}
								subtitle={startingNode.id}
								{...props}
							/>
						</DialogTrigger>
						<DialogContent>
							<DialogTitle className="sr-only">
								Override inputs to test workflow
							</DialogTitle>

							<TriggerInputDialog
								node={startingNode}
								connectionIds={itemData.connectionIds}
								onClose={() => {
									setIsDropdownOpen(false);
									setOpenDialogNodeId(null);
								}}
							/>
						</DialogContent>
					</Dialog>
				);
			}}
			trigger={
				<Button
					leftIcon={<PlayIcon className="size-[15px] fill-current" />}
					variant="glass"
					size="large"
				>
					Run
				</Button>
			}
			sideOffset={4}
			align="end"
		/>
	);
}
