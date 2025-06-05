import { isOperationNode, isTriggerNode } from "@giselle-sdk/data-type";
import { defaultName } from "@giselle-sdk/node-utils";
import clsx from "clsx/lite";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { CirclePlayIcon } from "lucide-react";
import { Dialog, DropdownMenu } from "radix-ui";
import { useMemo, useState } from "react";
import { NodeIcon } from "../../icons/node";
import { TriggerInputDialog } from "../ui";
import { Button } from "./ui/button";

export function RunButton() {
	const { data } = useWorkflowDesigner();

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const startingNodes = useMemo(() => {
		const triggerNodes = data.nodes.filter((node) => isTriggerNode(node));
		const startingOperationNodes = data.nodes.filter((node) => {
			if (!isOperationNode(node)) {
				return false;
			}
			if (isTriggerNode(node)) {
				return false;
			}
			if (node.inputs.length > 0) {
				return false;
			}
			return true;
		});
		return [...triggerNodes, ...startingOperationNodes];
	}, [data.nodes]);
	return (
		<DropdownMenu.Root open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
			<DropdownMenu.Trigger asChild>
				<Button leftIcon={<CirclePlayIcon className="size-[15px]" />}>
					Run
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content
					className={clsx(
						"relative rounded-[8px] px-[8px] py-[8px] min-w-[200px]",
						"bg-[hsla(255,_40%,_98%,_0.04)] text-white-900",
						"backdrop-blur-[4px]",
					)}
					sideOffset={5}
					align="end"
				>
					<div className="absolute z-0 rounded-[8px] inset-0 border mask-fill bg-gradient-to-br from-[hsla(232,37%,72%,0.2)] to-[hsla(218,58%,21%,0.9)] bg-origin-border bg-clip-border border-transparent" />
					{startingNodes.map((startingNode) => (
						<DropdownMenu.Item key={startingNode.id} asChild>
							{isTriggerNode(startingNode) ? (
								<Dialog.Root
									open={isDialogOpen}
									onOpenChange={(isOpen) => {
										setIsDialogOpen(isOpen);
									}}
								>
									<Dialog.Trigger className="group relative flex items-center py-[8px] px-[12px] gap-[10px] outline-none cursor-pointer hover:bg-black-400/20 rounded-[6px] w-full">
										<>
											<div className="p-[12px] bg-black-800 rounded-[8px]">
												<NodeIcon
													node={startingNode}
													className="size-[16px] text-white-900"
												/>
											</div>
											<div className="flex flex-col gap-[0px] text-white-900 items-start">
												<div className="text-[13px]">
													{startingNode.name ?? defaultName(startingNode)}
												</div>
												<div className="text-[12px] text-white-400">
													{startingNode.id}
												</div>
											</div>
										</>
									</Dialog.Trigger>
									<Dialog.Portal>
										<Dialog.Overlay className="fixed inset-0 bg-black/25 z-50" />
										<Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[400px] bg-black-900 rounded-[12px] p-[24px] shadow-xl z-50 overflow-hidden border border-black-400 outline-none">
											<Dialog.Title className="sr-only">
												Override inputs to test workflow
											</Dialog.Title>

											<TriggerInputDialog
												node={startingNode}
												onClose={() => {
													setIsDropdownOpen(false);
													setIsDialogOpen(false);
												}}
											/>
										</Dialog.Content>
									</Dialog.Portal>
								</Dialog.Root>
							) : (
								<button
									type="button"
									className="group relative flex items-center py-[8px] px-[12px] gap-[10px] outline-none cursor-pointer hover:bg-black-400/20 rounded-[6px] w-full"
								>
									<div className="p-[12px] bg-black-800 rounded-[8px]">
										<NodeIcon
											node={startingNode}
											className="size-[16px] text-white-900"
										/>
									</div>
									<div className="flex flex-col gap-[0px] text-white-900 items-start">
										<div className="text-[13px]">
											{startingNode.name ?? defaultName(startingNode)}
										</div>
										<div className="text-[12px] text-white-400">
											{startingNode.id}
										</div>
									</div>
								</button>
							)}
						</DropdownMenu.Item>
					))}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
