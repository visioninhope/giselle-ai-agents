"use client";

import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { FileUpIcon, LetterTextIcon, MousePointer2Icon } from "lucide-react";
import { type ComponentProps, forwardRef } from "react";
import { TextGenerationIcon } from "../../beta-proto/components/icons/text-generation";
import { useToolbar } from "../contexts/toolbar";
import type { Tool } from "../types";

function ToggleGroupItem({
	tooltip,
	value,

	...props
}: ComponentProps<typeof ToggleGroup.Item> & { tooltip: string }) {
	const { selectedTool } = useToolbar();
	return (
		<TooltipPrimitive.Provider>
			<TooltipPrimitive.Root>
				<TooltipPrimitive.Trigger asChild>
					<ToggleGroup.Item
						value={value}
						className="hover:bg-white/20 p-[4px] rounded-[4px] data-[state=on]:bg-black-80 focus:outline-none "
						data-state={selectedTool?.action === value ? "on" : "off"}
						{...props}
					/>
				</TooltipPrimitive.Trigger>
				<TooltipPrimitive.Portal>
					<TooltipPrimitive.Content
						sideOffset={18}
						className="z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
					>
						{tooltip}
					</TooltipPrimitive.Content>
				</TooltipPrimitive.Portal>
			</TooltipPrimitive.Root>
		</TooltipPrimitive.Provider>
	);
}

export function Toolbar() {
	const { selectTool } = useToolbar();
	return (
		<div className="relative rounded-[46px] overflow-hidden bg-black-100">
			<div className="absolute z-0 rounded-[46px] inset-0 border mask-fill bg-gradient-to-br from-[hsla(232,37%,72%,0.2)] to-[hsla(218,58%,21%,0.9)] bg-origin-border bg-clip-boarder border-transparent" />
			<div className="flex divide-x divide-[hsla(232,36%,72%,0.2)] items-center px-[8px] py-[8px]">
				<ToggleGroup.Root
					type="single"
					className="flex items-center px-[16px] z-10 h-full"
					onValueChange={(value) => {
						selectTool(value as Tool["action"]);
					}}
					onKeyUp={(key) => {
						if (key.code === "Escape") {
							selectTool("move");
						}
					}}
				>
					<div className="flex gap-[12px]">
						<ToggleGroupItem value="move" tooltip="Move">
							<MousePointer2Icon
								className={"w-[24px] h-[24px] text-black-30"}
							/>
						</ToggleGroupItem>
						<ToggleGroupItem value="addTextNode" tooltip="Text">
							<LetterTextIcon className={"w-[24px] h-[24px] text-black-30"} />
						</ToggleGroupItem>
						<ToggleGroupItem value="addFileNode" tooltip="File">
							<FileUpIcon className={"w-[24px] h-[24px] text-black-30 "} />
						</ToggleGroupItem>
						<ToggleGroupItem
							value="addTextGenerationNode"
							tooltip="Text Generator"
						>
							<TextGenerationIcon
								className={"w-[24px] h-[24px] text-black-30 fill-current"}
							/>
						</ToggleGroupItem>
					</div>
				</ToggleGroup.Root>
			</div>
		</div>
	);
}
