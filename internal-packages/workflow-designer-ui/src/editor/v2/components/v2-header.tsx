"use client";

import clsx from "clsx/lite";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { ChevronDownIcon } from "lucide-react";
import { useRef } from "react";
import { GiselleIcon } from "../../../icons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../../ui/select";
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
				"relative h-[44px] flex items-center justify-between",
				"pl-[16px] pr-[16px] gap-[8px]",
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
					<span className="truncate max-w-[160px]">
						<EditableText
							ref={editableTextRef}
							fallbackValue="Untitled"
							onChange={handleUpdateName}
							value={data.name}
							className="text-[#6B8FF0]"
						/>
					</span>
					{/* dropdown menu */}
					<Select
						onValueChange={(value) => {
							switch (value) {
								case "rename":
									editableTextRef.current?.triggerEdit();
									break;
								case "duplicate":
									console.debug("Duplicate app – not yet implemented");
									break;
								case "delete":
									console.debug("Delete app – not yet implemented");
									break;
							}
						}}
					>
						<SelectTrigger className="ml-[4px] p-0 border-none bg-transparent w-auto h-auto hover:bg-transparent focus:bg-transparent">
							<ChevronDownIcon className="size-[16px] text-[#6B8FF0] hover:text-white-950" />
						</SelectTrigger>
						<SelectContent
							className="min-w-[165px] bg-black-900 text-white-900 border-[0.25px] border-white/10 rounded-[8px] p-1"
							sideOffset={12}
							align="start"
						>
							<SelectItem value="rename">Rename</SelectItem>
							<SelectItem value="duplicate">Duplicate</SelectItem>
							<SelectItem
								value="template"
								disabled
								className="opacity-50 cursor-not-allowed"
							>
								<div className="flex items-center justify-between w-full">
									<span>Create a Template</span>
									<span className="ml-2 text-[10px] leading-none text-white-600 bg-white/30 px-1.5 py-[1px] rounded-full">
										Coming&nbsp;soon
									</span>
								</div>
							</SelectItem>
							<div className="my-2 h-px bg-white/10" />
							<SelectItem
								value="delete"
								className="text-error-900 hover:bg-error-900/20"
							>
								Delete
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Right section: Run button */}
			<RunButton />
		</div>
	);
}
