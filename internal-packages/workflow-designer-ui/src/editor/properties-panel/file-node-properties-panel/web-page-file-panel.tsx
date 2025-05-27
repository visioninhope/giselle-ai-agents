import type { FileNode } from "@giselle-sdk/data-type";
import type { FileTypeConfig } from "./file-panel";

export function WebPageFilePanel({
	node,
	config,
}: { node: FileNode; config: FileTypeConfig }) {
	return (
		<div className="relative z-10 flex flex-col gap-[2px] h-full text-[14px] text-black-300">
			{/* demo */}
			<div className="flex flex-col gap-[8px]">
				<div className="flex flex-col gap-[4px]">
					<label
						htmlFor="webpage-format"
						className="font-semibold text-white-800"
					>
						Web Page
					</label>
				</div>
			</div>
		</div>
	);
}
