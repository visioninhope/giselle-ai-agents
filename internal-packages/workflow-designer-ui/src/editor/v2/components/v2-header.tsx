"use client";

import clsx from "clsx/lite";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { useRef } from "react";
import { GiselleIcon } from "../../../icons";
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
				"relative h-[54px] flex items-center justify-between",
				"pl-[16px] pr-[16px] gap-[12px]",
				"border-b border-black-600",
				"shrink-0",
			)}
		>
			{/* Left section: Logo + Team/App names */}
			<div className="flex items-center gap-[4px] min-w-0">
				<GiselleIcon className="text-white-900 w-[30px] h-[30px]" />
				<span className="text-white-900 text-[14px] font-semibold">Studio</span>
				<span className="text-white-900/20 text-[20px] font-[250] leading-none ml-[6px]">
					/
				</span>

				{/* Team / App names */}
				<div className="flex items-center gap-[4px] min-w-0 ml-[8px]">
					{teamName && (
						<span className="text-[#6B8FF0] text-[14px] truncate max-w-[160px]">
							{teamName}
						</span>
					)}
					{teamName && (
						<span className="text-white-600 text-[20px] font-[250] leading-none">
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
				</div>
			</div>

			{/* Right section: Run button */}
			<RunButton />
		</div>
	);
}
