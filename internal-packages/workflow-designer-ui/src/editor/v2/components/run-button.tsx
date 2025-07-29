import { Button } from "@giselle-internal/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@giselle-internal/ui/dialog";
import { DropdownMenu } from "@giselle-internal/ui/dropdown-menu";
import { useToasts } from "@giselle-internal/ui/toast";
import { isTriggerNode } from "@giselle-sdk/data-type";
import {
	defaultName,
	useActController,
	useAllTriggerDAGs,
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
	const triggerDags = useAllTriggerDAGs();
	const startingNodes = useMemo(() => {
		const operationNodeGroups = nodeGroups.filter(
			(nodeGroup) => !nodeGroup.nodes.some((node) => isTriggerNode(node)),
		);
		return [
			{
				groupId: "triggerNodes",
				groupLabel: "Trigger Nodes",
				items: triggerDags.map((triggerDag) => ({
					type: "triggerNode",
					value: triggerDag.triggerNodeId,
					label:
						triggerDag.triggerNode.name ?? defaultName(triggerDag.triggerNode),
					node: triggerDag.triggerNode,
					nodeIds: triggerDag.dag.nodeIds,
					connectionIds: triggerDag.dag.connectionIds,
					index: undefined,
				})),
			},
			{
				groupId: "operationNodes",
				groupLabel: "Node Group",
				items: operationNodeGroups.map((nodeGroup, index) => ({
					type: "nodeGroup",
					value: `opration-node-index-${index}`,
					label: `Group ${index + 1}`,
					node: undefined,
					nodeIds: nodeGroup.nodeIds,
					connectionIds: nodeGroup.connectionIds,
					index,
				})),
			},
		];
	}, [nodeGroups, triggerDags]);

	const { info } = useToasts();

	if (startingNodes.length === 0) {
		return null;
	}

	return (
		<DropdownMenu
			open={isDropdownOpen}
			onOpenChange={setIsDropdownOpen}
			onSelect={async (_event, item) => {
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
			}}
			onItemHover={(item, isHovered) => {
				for (const node of data.nodes) {
					if (!item.nodeIds.includes(node.id)) {
						continue;
					}
					setUiNodeState(node.id, { highlighted: isHovered });
				}
			}}
			items={startingNodes}
			renderItemAsChild
			renderItem={(item, props) => {
				const startingNode = item.node;
				if (startingNode === undefined || !isTriggerNode(startingNode)) {
					return (
						<DropdownMenuItem
							icon={<div className="bg-ghost-element-background size-[16px]" />}
							title={item.label}
							subtitle={item.value}
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
