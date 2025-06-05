import { isOperationNode, isTriggerNode } from "@giselle-sdk/data-type";
import { defaultName } from "@giselle-sdk/node-utils";
import clsx from "clsx/lite";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { DropdownMenu } from "radix-ui";
import { useMemo } from "react";
import { NodeIcon } from "../../icons/node";
import { Button } from "./ui/button";

export function RunButton() {
	const { data } = useWorkflowDesigner();
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
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<Button>Run</Button>
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
						<DropdownMenu.Item
							className="group relative flex items-center py-[8px] px-[12px] gap-[6px] outline-none cursor-pointer"
							key={startingNode.id}
						>
							<NodeIcon node={startingNode} className="size-[24px]" />
							<div className="flex flex-col gap-[0px] text-white-900">
								<div className="text-[13px]">
									{startingNode.name ?? defaultName(startingNode)}
								</div>
								<div className="text-[12px] text-white-800">
									{startingNode.id}
								</div>
							</div>
						</DropdownMenu.Item>
					))}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
