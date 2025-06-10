import type { TextGenerationNode } from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { ChevronRightIcon, DatabaseIcon } from "lucide-react";
import { type SVGProps, useMemo } from "react";
import { GitHubIcon } from "../../../tool";

type UIToolName = "GitHub" | "PostgreSQL";
interface UITool {
	name: UIToolName;
	commands: string[];
}

function ToolIcon({
	name,
	...props
}: { name: UIToolName } & SVGProps<SVGSVGElement>) {
	switch (name) {
		case "GitHub":
			return <GitHubIcon {...props} />;
		case "PostgreSQL":
			return <DatabaseIcon {...props} />;
		default: {
			const _exhaustiveCheck: never = name;
			throw new Error(`Unhandled tool name: ${_exhaustiveCheck}`);
		}
	}
}

export function ToolsPanel({
	node,
}: {
	node: TextGenerationNode;
}) {
	const { enableTools, availableTools } = useMemo(() => {
		const enableTools: UITool[] = [];
		const availableTools: UITool[] = [];
		if (node.content.tools?.github === undefined) {
			availableTools.push({
				name: "GitHub",
				commands: [],
			});
		} else {
			enableTools.push({
				name: "GitHub",
				commands: node.content.tools.github.tools,
			});
		}
		if (node.content.tools?.postgres === undefined) {
			availableTools.push({
				name: "PostgreSQL",
				commands: [],
			});
		} else {
			enableTools.push({
				name: "PostgreSQL",
				commands: node.content.tools.postgres.tools,
			});
		}
		return {
			enableTools,
			availableTools,
		};
	}, [node.content.tools]);

	return (
		<div className="text-white-400 space-y-[16px]">
			{enableTools.length > 0 && (
				<div className="space-y-[8px]">
					<h2 className="text-[15px] font-accent">Enabled Tools</h2>
					<div className="space-y-[6px]">
						{enableTools.map((tool) => (
							<div
								key={tool.name}
								className="border border-black-400 rounded-[8px] p-[6px] flex items-center justify-between hover:bg-black-800/50 transition-all duration-200 cursor-pointer h-[52px]"
							>
								<div className="flex gap-[8px]">
									<div className="rounded-[6px] size-[38px] flex items-center justify-center bg-white-400/40">
										<ToolIcon
											name={tool.name}
											className="size-[24px] text-white"
										/>
									</div>
									<div>
										<div className="flex items-center gap-2">
											<h3 className="text-[15px]">{tool.name}</h3>
										</div>
										<p className="text-black-300 text-[11px]">
											2 tools enabled
										</p>
									</div>
								</div>
								<ChevronRightIcon className="w-5 h-5 text-gray-400" />
							</div>
						))}
					</div>
				</div>
			)}

			{availableTools.length > 0 && (
				<div className="space-y-[8px]">
					<h2 className="text-[15px] font-accent">Available Tools</h2>
					<div className="space-y-[8px]">
						{availableTools.map((tool) => (
							<div
								key={tool.name}
								className="border border-black-400 rounded-[8px] p-[6px] flex items-center justify-between hover:bg-black-800/50 transition-all duration-200 cursor-pointer h-[52px]"
							>
								<div className="flex gap-[8px]">
									<div className="rounded-[6px] size-[38px] shrink-0 aspect-square flex items-center justify-center bg-white-400/40">
										<ToolIcon
											name={tool.name}
											className="size-[24px] text-white"
										/>
									</div>
									<div>
										<div className="flex items-center gap-2">
											<h3 className="text-[15px]">{tool.name}</h3>
										</div>
										<p className="text-black-300 text-[11px]">
											Add {tool.name} tool
										</p>
									</div>
								</div>
								<ChevronRightIcon className="w-5 h-5 text-gray-400" />
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
