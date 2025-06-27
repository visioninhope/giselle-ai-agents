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
				</div>
			</div>

			{/* Right section: Run button */}
			<RunButton />
		</div>
	);
}
