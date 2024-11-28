"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { BracesIcon, FileIcon, LetterTextIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { useToolbar } from "../contexts/toolbar";
import type { Tool } from "../types";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "./dropdown-menu";

const Popover = PopoverPrimitive.Root;

function PopoverTrigger({
	tooltip,
	...props
}: ComponentProps<typeof PopoverPrimitive.Trigger> & { tooltip: string }) {
	return (
		<TooltipPrimitive.Provider>
			<TooltipPrimitive.Root>
				<TooltipPrimitive.Trigger>
					<PopoverPrimitive.Trigger {...props} />
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

function PopoverContent({
	className,
	align = "center",
	sideOffset = 4,
	...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
	return (
		<PopoverPrimitive.Portal>
			<PopoverPrimitive.Content
				align={align}
				sideOffset={sideOffset}
				className="z-50 bg-black-100 border-[0.5px] border-black-70 rounded-[16px] px-[16px] py-[8px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
				style={{
					boxShadow: "0px 0px 2px 0px hsla(0, 0%, 100%, 0.1) inset",
				}}
				{...props}
			/>
		</PopoverPrimitive.Portal>
	);
}
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export function Toolbar() {
	const { open, setOpen, tool, setTool } = useToolbar();
	return (
		<div className="relative rounded-[46px] overflow-hidden bg-black-100">
			<div className="absolute z-0 rounded-[46px] inset-0 border mask-fill bg-gradient-to-br from-[hsla(232,37%,72%,0.2)] to-[hsla(218,58%,21%,0.9)] bg-origin-border bg-clip-boarder border-transparent" />
			<div className="flex divide-x divide-[hsla(232,36%,72%,0.2)] items-center h-[46px] px-[8px]">
				<div className="flex items-center px-2 z-10 h-full">
					<div className="flex gap-[4px]">
						<DropdownMenu open={open}>
							<DropdownMenuTrigger onClick={() => setOpen(true)}>
								{/* <PopoverTrigger tooltip="Variable"> */}
								<BracesIcon className="text-black-30" />
								{/* </PopoverTrigger> */}
							</DropdownMenuTrigger>
							<DropdownMenuContent align="center" sideOffset={18}>
								<DropdownMenuRadioGroup
									value={tool}
									onValueChange={(value) => {
										setTool(value as Tool);
									}}
								>
									<DropdownMenuRadioItem value="addTextNode">
										<div className="flex items-center gap-[4px]">
											<LetterTextIcon className={"w-[16px] h-[16px]"} />
											<p>Text</p>
										</div>
									</DropdownMenuRadioItem>
									<DropdownMenuRadioItem value="addFileNode">
										<div className="flex items-center gap-[4px]">
											<FileIcon className={"w-[16px] h-[16px]"} />
											<p>File</p>
										</div>
									</DropdownMenuRadioItem>
								</DropdownMenuRadioGroup>
							</DropdownMenuContent>
							{/* <PopoverContent sideOffset={24}>
								<div className="grid">
									 <ToolSelectOption
										tool={{
											type: "addGiselleNode",
											giselleNodeBlueprint: textGeneratorBlueprint,
										}}
										icon={
											<TextGenerationIcon className="fill-black-30 w-[16px] h-[16px]" />
										}
										label="Text Generation"
									/>
									<ToolSelectOption
										tool={{
											type: "addGiselleNode",
											giselleNodeBlueprint: webSearchBlueprint,
										}}
										icon={
											<GlobeIcon className="fill-black-30 w-[16px] h-[16px]" />
										}
										label="Web Search"
								</div>
							</PopoverContent> */}
						</DropdownMenu>
					</div>
				</div>
			</div>
		</div>
	);
}
