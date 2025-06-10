import type { TextGenerationNode } from "@giselle-sdk/data-type";
import { ChevronLeftIcon, ChevronRightIcon, DatabaseIcon } from "lucide-react";
import { type SVGProps, useMemo, useState } from "react";
import { GitHubIcon } from "../../../tool";
import { GitHubToolsPanel } from "./github-tools";
import { PostgresToolsPanel } from "./postgres-tools";

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

function ToolsSection({
	title,
	tools,
	description,
	onToolClick,
}: {
	title: string;
	tools: UITool[];
	description: (tool: UITool) => string;
	onToolClick?: (tool: UITool) => void;
}) {
	if (tools.length === 0) return null;
	return (
		<div className="space-y-[8px]">
			<h2 className="text-[15px] font-accent">{title}</h2>
			<div className="space-y-[6px]">
				{tools.map((tool) => (
					<button
						key={tool.name}
						type="button"
						className="border border-black-400 rounded-[8px] p-[6px] w-full flex items-center justify-between hover:bg-black-800/50 transition-all duration-200 cursor-pointer h-[52px]"
						onClick={onToolClick ? () => onToolClick(tool) : undefined}
					>
						<div className="flex gap-[8px]">
							<div className="rounded-[6px] size-[38px] flex items-center justify-center bg-white-400/40">
								<ToolIcon name={tool.name} className="size-[24px] text-white" />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h3 className="text-[15px]">{tool.name}</h3>
								</div>
								<p className="text-black-300 text-[11px]">
									{description(tool)}
								</p>
							</div>
						</div>
						<ChevronRightIcon className="w-5 h-5 text-gray-400" />
					</button>
				))}
			</div>
		</div>
	);
}

export function ToolsPanel({
	node,
}: {
	node: TextGenerationNode;
}) {
	const [selectedTool, setSelectedTool] = useState<UIToolName>();
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

	if (selectedTool) {
		return (
			<div className="text-white-400 space-y-[16px]">
				<button
					type="button"
					className="flex items-center gap-[4px] text-[13px] text-white-800 cursor-pointer"
					onClick={() => setSelectedTool(undefined)}
				>
					<ChevronLeftIcon className="size-[16px]" />
					Back
				</button>
				{selectedTool === "GitHub" && <GitHubToolsPanel node={node} />}
				{selectedTool === "PostgreSQL" && <PostgresToolsPanel node={node} />}
			</div>
		);
	}

	return (
		<div className="text-white-400 space-y-[16px]">
			<ToolsSection
				title="Enabled Tools"
				tools={enableTools}
				description={(tool) =>
					`${tool.commands.length} ${tool.commands.length > 1 ? "tools" : "tool"} enabled`
				}
			/>
			<ToolsSection
				title="Available Tools"
				tools={availableTools}
				description={(tool) => `Add ${tool.name} tool`}
				onToolClick={(tool) => setSelectedTool(tool.name)}
			/>
		</div>
	);
}
