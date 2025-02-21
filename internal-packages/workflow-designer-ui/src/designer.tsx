"use client";

import { WorkspaceProvider, useWorkflowDesigner } from "giselle-sdk/react";
import { Editor } from "./editor";
import { Viewer } from "./viewer";
import "@xyflow/react/dist/style.css";
import clsx from "clsx/lite";
import { PlayIcon } from "lucide-react";
import { GiselleLogo, ViewIcon } from "./icons";

export function DesignerInternal() {
	const { view } = useWorkflowDesigner();
	return (
		<div className="flex flex-col h-full bg-black-900">
			<div className="pl-[24px] pr-[16px] py-[8px] flex items-center justify-between">
				<GiselleLogo className="fill-white-900 w-[70px] h-auto mt-[6px]" />
				<div className="flex items-center">
					<button
						type="button"
						className={clsx(
							"flex py-[8px] px-[16px] justify-center items-center gap-[4px]",
							"rounded-[8px]",
							"bg-primary-900 text-[14px] text-white-900",
							"cursor-pointer",
						)}
					>
						<PlayIcon className="size-[16px] fill-white-900" />
						<p>Run</p>
					</button>
				</div>
			</div>
			{view === "editor" ? <Editor /> : null}
			{view === "viewer" ? <Viewer /> : null}
		</div>
	);
}

export function Designer() {
	return <DesignerInternal />;
}
