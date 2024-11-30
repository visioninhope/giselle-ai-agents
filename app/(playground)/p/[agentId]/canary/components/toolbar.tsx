"use client";

import { starNorth } from "@lucide/lab";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { FileUpIcon, LetterTextIcon } from "lucide-react";
import { type ComponentProps, forwardRef } from "react";
import { TextGenerationIcon } from "../../beta-proto/components/icons/text-generation";
import { useToolbar } from "../contexts/toolbar";
import type { Tool } from "../types";

const toggleGroupItemClasses =
	"hover:bg-white/20 p-[4px] rounded-[4px] data-[state=on]:bg-black-80";
export function Toolbar() {
	const {
		activeToolbarSection,
		setToolbarSection,
		clearToolAndSections,
		selectedTool,
		selectTool,
	} = useToolbar();
	return (
		<div className="relative rounded-[46px] overflow-hidden bg-black-100">
			<div className="absolute z-0 rounded-[46px] inset-0 border mask-fill bg-gradient-to-br from-[hsla(232,37%,72%,0.2)] to-[hsla(218,58%,21%,0.9)] bg-origin-border bg-clip-boarder border-transparent" />
			<div className="flex divide-x divide-[hsla(232,36%,72%,0.2)] items-center px-[8px] py-[8px]">
				<ToggleGroup.Root
					type="single"
					className="flex items-center px-[16px] z-10 h-full"
					onValueChange={(value) => {
						selectTool(value as Tool);
					}}
				>
					<div className="flex gap-[12px]">
						<ToggleGroup.Item
							value="addTextNode"
							className={toggleGroupItemClasses}
							data-state={selectedTool === "addTextNode" ? "on" : "off"}
						>
							<LetterTextIcon className={"w-[24px] h-[24px] text-black-30"} />
						</ToggleGroup.Item>
						<ToggleGroup.Item
							value="addFileNode"
							className={toggleGroupItemClasses}
							data-state={selectedTool === "addFileNode" ? "on" : "off"}
						>
							<FileUpIcon className={"w-[24px] h-[24px] text-black-30 "} />
						</ToggleGroup.Item>
						<ToggleGroup.Item
							value="addTextGenerationNode"
							className={toggleGroupItemClasses}
							data-state={
								selectedTool === "addTextGenerationNode" ? "on" : "off"
							}
						>
							<TextGenerationIcon
								className={"w-[24px] h-[24px] text-black-30 fill-current"}
							/>
						</ToggleGroup.Item>
					</div>
				</ToggleGroup.Root>
			</div>
		</div>
	);
}
