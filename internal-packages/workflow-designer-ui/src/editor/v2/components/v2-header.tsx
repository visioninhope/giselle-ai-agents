"use client";

import clsx from "clsx/lite";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { ChevronDownIcon } from "lucide-react";
import { useRef } from "react";
import { GiselleIcon } from "../../../icons";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import { EditableText, type EditableTextRef } from "../../properties-panel/ui";
import { RunButton } from "./run-button";

export function V2Header({ teamName }: { teamName?: string }) {
	const { data, updateName } = useWorkflowDesigner();
	const editableTextRef = useRef<EditableTextRef>(null);

	const handleUpdateName = (value?: string) => {
		if (!value) return;
		updateName(value);
	};

	return (
		<div
			className={clsx(
				"relative h-[48px] flex items-center justify-between",
				"pl-[8px] pr-[8px] gap-[8px]",
				"border-b border-black-600",
				"shrink-0",
			)}
		>
			{/* Left section: Logo + Team/App names */}
			<div className="flex items-center gap-[3px] min-w-0">
				<GiselleIcon className="text-white-900 w-[24px] h-[24px]" />
				<span className="text-white-900 text-[13px] font-semibold">Studio</span>
				<span className="text-white-900/20 text-[18px] font-[250] leading-none ml-[4px]">
					/
				</span>

				{/* Team / App names */}
				<div className="flex items-center gap-[3px] min-w-0 ml-[6px]">
					{teamName && (
						<span className="text-[#6B8FF0] text-[13px] truncate max-w-[160px]">
							{teamName}
						</span>
					)}
					{teamName && (
						<span className="text-white-600 text-[18px] font-[250] leading-none">
							/
						</span>
					)}
					{/* app name editable */}
					<div className="max-w-[200px]">
						<EditableText
							ref={editableTextRef}
							fallbackValue="Untitled"
							onChange={handleUpdateName}
							value={data.name}
							className="text-[#6B8FF0] text-[13px] font-medium"
						/>
					</div>
					{/* dropdown menu */}
					<DropdownMenu>
						<DropdownMenuTrigger className="ml-[4px] p-0 border-none bg-transparent w-auto h-auto hover:bg-transparent focus:bg-transparent outline-none">
							<ChevronDownIcon className="size-[16px] text-[#6B8FF0] hover:text-white-950" />
						</DropdownMenuTrigger>
						<DropdownMenuContent sideOffset={12} align="start">
							<button
								type="button"
								className="relative flex cursor-default select-none items-center py-[8px] pl-2 pr-8 text-sm outline-none transition-colors focus:bg-white-900/20 focus:text-white-900 hover:bg-white-900/20 hover:text-white-900 w-full text-left"
								onClick={() => {
									editableTextRef.current?.triggerEdit();
								}}
							>
								Rename
							</button>
							<button
								type="button"
								className="relative flex cursor-default select-none items-center py-[8px] pl-2 pr-8 text-sm outline-none transition-colors focus:bg-white-900/20 focus:text-white-900 hover:bg-white-900/20 hover:text-white-900 w-full text-left"
								onClick={() => {
									console.debug("Duplicate app – not yet implemented");
								}}
							>
								Duplicate
							</button>
							<button
								type="button"
								disabled
								className="relative flex cursor-not-allowed select-none items-center py-[8px] pl-2 pr-8 text-sm outline-none opacity-50 w-full text-left"
							>
								<div className="flex items-center justify-between w-full">
									<span>Create a Template</span>
									<span className="ml-2 text-[10px] leading-none text-white-600 bg-white/30 px-1.5 py-[1px] rounded-full">
										Coming&nbsp;soon
									</span>
								</div>
							</button>
							<div className="my-2 h-px bg-muted" />
							<button
								type="button"
								className="relative flex cursor-default select-none items-center py-[8px] pl-2 pr-8 text-sm outline-none transition-colors focus:bg-error-900/20 focus:text-error-900 hover:bg-error-900/20 hover:text-error-900 text-error-900 w-full text-left"
								onClick={() => {
									console.debug("Delete app – not yet implemented");
								}}
							>
								Delete
							</button>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Right section: Run button */}
			<RunButton />
		</div>
	);
}
