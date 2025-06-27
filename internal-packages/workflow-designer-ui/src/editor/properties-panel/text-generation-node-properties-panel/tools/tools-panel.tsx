import type { Dialog } from "@giselle-internal/ui/dialog";
import { SecretId, type TextGenerationNode } from "@giselle-sdk/data-type";
import clsx from "clsx/lite";
import { CheckIcon } from "lucide-react";
import type { ComponentProps, PropsWithChildren, ReactNode } from "react";
import { z } from "zod/v4";
import { GitHubIcon } from "../../../tool";
import { GitHubToolConfigurationDialog } from "./tool-provider/github";

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
			>
				<div className="flex gap-[10px] items-center">
					<h3 className="text-text text-[14px]">GitHub</h3>
					{node.content.tools?.github && (
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
}
function ToolListItem({
	children,
	icon,
	configurationPanel,
}: PropsWithChildren<ToolListItemProps>) {
	return (
		<div
			className={clsx(
				"border border-border rounded-[8px] px-[12px] w-full flex items-center justify-between py-[10px]",
				"**:data-tool-icon:size-[20px] **:data-tool-icon:text-text-muted",
				"**:data-dialog-trigger-icon:size-[14px]",
			)}
		>
			<div className="flex gap-[10px] items-center">
				{icon}
				{children}
			</div>
			{configurationPanel}
		</div>
	);
}
