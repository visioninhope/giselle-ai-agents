import type { TextGenerationNode } from "@giselle-sdk/data-type";
import clsx from "clsx/lite";
import { CheckIcon, DatabaseIcon } from "lucide-react";
import type { PropsWithChildren, ReactNode } from "react";
import { GitHubIcon } from "../../../tool";
import { GitHubToolConfigurationDialog } from "./tool-provider/github";
import { PostgresToolConfigurationDialog } from "./tool-provider/postgres";

export function ToolsPanel({
	node,
}: {
	node: TextGenerationNode;
}) {
	return (
		<div className="text-white-400 space-y-[16px]">
			<ToolListItem
				icon={<GitHubIcon data-tool-icon />}
				configurationPanel={<GitHubToolConfigurationDialog node={node} />}
				availableTools={node.content.tools?.github?.tools}
			>
				<div className="flex gap-[10px] items-center">
					<h3 className="text-text text-[14px]">GitHub</h3>
					{node.content.tools?.github && (
						<CheckIcon className="size-[14px] text-success" />
					)}
				</div>
			</ToolListItem>
			<ToolListItem
				icon={<DatabaseIcon data-tool-icon />}
				configurationPanel={<PostgresToolConfigurationDialog node={node} />}
				availableTools={node.content.tools?.postgres?.tools}
			>
				<div className="flex gap-[10px] items-center">
					<h3 className="text-text text-[14px]">PostgreSQL</h3>
					{node.content.tools?.postgres && (
						<CheckIcon className="size-[14px] text-success" />
					)}
				</div>
			</ToolListItem>
		</div>
	);
}

interface ToolListItemProps {
	icon: ReactNode;
	configurationPanel: ReactNode;
	availableTools?: string[];
}
function ToolListItem({
	children,
	icon,
	configurationPanel,
	availableTools = [],
}: PropsWithChildren<ToolListItemProps>) {
	return (
		<div
			className={clsx(
				"border border-border rounded-[8px] px-[12px] w-full py-[10px]",
				"**:data-tool-icon:size-[20px] **:data-tool-icon:text-text-muted",
				"**:data-dialog-trigger-icon:size-[14px]",
			)}
		>
			<div className=" flex items-center justify-between">
				<div className="flex gap-[10px] items-center">
					{icon}
					{children}
				</div>
				{configurationPanel}
			</div>
			{availableTools.length > 0 && (
				<div className="mt-[6px]">
					<div className="flex flex-wrap text-[12px] text-text-muted gap-x-[6px] gap-y-[6px]">
						{availableTools.map((availableTool) => (
							<p
								className="border border-border rounded-full px-[6px] py-[1px]"
								key={availableTool}
							>
								{availableTool}
							</p>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
