import type { TextGenerationNode } from "@giselle-sdk/data-type";
import clsx from "clsx/lite";
import {
	ChevronDownIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	DatabaseIcon,
	MoveUpRightIcon,
} from "lucide-react";
import { DropdownMenu, Tabs } from "radix-ui";
import { type SVGProps, useMemo, useState } from "react";
import { GitHubIcon } from "../../../tool";
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
			<h2 className="text-[15px] font-accent text-white-800">{title}</h2>
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
			<div className="text-text space-y-[8px]">
				<button
					type="button"
					className="flex items-center gap-[4px] text-[15px] font-accent text-white-800 cursor-pointer"
					onClick={() => setSelectedTool(undefined)}
				>
					<ChevronLeftIcon className="size-[16px]" />
					Add GitHub tool
				</button>
				<div className="bg-editor-background border text border-border rounded-[8px] p-[6px] ">
					<div className="flex gap-[8px] mb-[8px]">
						<div className="rounded-[6px] size-[38px] flex items-center justify-center bg-white-400/40">
							<ToolIcon name="GitHub" className="size-[24px] text-white" />
						</div>
						<div>
							<div className="flex items-center gap-2">
								<h3 className="text-[15px] text-xs">GitHub</h3>
							</div>
							<p className="text-black-300 text-[11px]">Add GitHub tool</p>
						</div>
					</div>

					<p className="text-text text-[14px] mb-[6px]">
						Choose how you want to provide your GitHub Personal Access Token
					</p>
					<Tabs.Root defaultValue="create">
						<Tabs.List
							className={clsx(
								"bg-tab-inactive-background px-[4px] py-[3px] rounded-[2px] flex justify-center items-center",
								"**:data-trigger:flex-1 **:data-trigger:rounded-[2px] **:data-trigger:border **:data-trigger:border-transparent",
								"**:data-trigger:outline-none **:data-trigger:text-text-mute **:data-trigger:font-accent",
								"**:data-trigger:text-[13px] **:data-trigger:tracking-wider **:data-trigger:py-[2px]",
								"**:data-trigger:data-[state=active]:bg-tab-active-background **:data-trigger:data-[state=active]:border-border **:data-trigger:data-[state=active]:text-text",
								"**:data-trigger:data-[state=inactive]:cursor-pointer",
							)}
						>
							<Tabs.Trigger value="create" data-trigger>
								Add New Token
							</Tabs.Trigger>
							<Tabs.Trigger value="select" data-trigger>
								Use Existing Token
							</Tabs.Trigger>
						</Tabs.List>
						<div className="h-[12px]" />
						<Tabs.Content value="create">
							<form>
								<div className="flex flex-col gap-[6px]">
									<fieldset className="flex flex-col">
										<label
											htmlFor="label"
											className="text-text text-[13px] mb-[2px]"
										>
											Label
										</label>
										<input
											type="text"
											id="label"
											name="label"
											className={clsx(
												"border border-border rounded-[2px] bg-editor-background outline-none px-[4px] py-[2px] text-[14px]",
												"focus:border-border-focused",
											)}
										/>
										<p className="text-[12px] text-text-muted">
											Once registered, this PAT can be referenced from other
											nodes. Enter a label to identify this PAT when referencing
											it.
										</p>
									</fieldset>
									<fieldset className="flex flex-col">
										<div className="flex justify-between mb-[2px]">
											<label htmlFor="pat" className="text-text text-[13px]">
												PAT
											</label>
											<a
												href="https://github.com/settings/personal-access-tokens"
												className="flex items-center gap-[4px] text-[13px] text-text-muted hover:bg-ghost-element-hover transition-colors px-[4px] rounded-[2px]"
												target="_blank"
												rel="noreferrer"
											>
												<span>GitHub</span>
												<MoveUpRightIcon className="size-[13px]" />
											</a>
										</div>
										<input
											type="text"
											id="pat"
											name="pat"
											className={clsx(
												"border border-border rounded-[2px] bg-editor-background outline-none px-[4px] py-[2px] text-[14px]",
												"focus:border-border-focused",
											)}
										/>
										<p className="text-[12px] text-text-muted">
											The entered PAT will be encrypted and stored using
											authenticated encryption.
										</p>
									</fieldset>
								</div>
								<div className="h-[12px]" />
								<div className="flex justify-end">
									<button
										type="submit"
										className="flex items-center gap-[4px] text-[14px] text-text hover:bg-ghost-element-hover transition-colors px-[4px] rounded-[2px] cursor-pointer"
									>
										Add token
									</button>
								</div>
							</form>
						</Tabs.Content>
						<Tabs.Content value="select" className="outline-none">
							<form>
								<p className="text-[12px] text-text-muted">
									Select from your saved secrets
								</p>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger asChild>
										<button
											type="button"
											className={clsx(
												"flex items-center justify-between gap-[2px] bg-background",
												"text-text text-[14px] border border-border rounded-[2px] w-full",
												"px-[8px] py-[4px] hover:bg-ghost-element-hover cursor-pointer transition-colors",
												"outline-none",
											)}
										>
											<span>Choose a saved token..</span>
											<ChevronDownIcon className="size-[13px]" />
										</button>
									</DropdownMenu.Trigger>
									<DropdownMenu.Portal>
										<DropdownMenu.Content
											sideOffset={2}
											className={clsx(
												"rounded-[2px] w-[var(--radix-dropdown-menu-trigger-width)] bg-panel-background",
												"p-[4px] border border-border-variant shadow",
												"**:data-item:text-text **:data-item:outline-none **:data-item:cursor-pointer **:data-item:hover:bg-ghost-element-hover",
												"**:data-item:rounded-[2px] **:data-item:px-[8px] **:data-item:py-[4px] **:data-item:text-[14px]",
											)}
										>
											<DropdownMenu.Item data-item>
												<span>Item 1</span>
											</DropdownMenu.Item>
											<DropdownMenu.Item data-item>
												<span>Item 2</span>
											</DropdownMenu.Item>
											<DropdownMenu.Item data-item>
												<span>Item 3</span>
											</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Portal>
								</DropdownMenu.Root>
							</form>
						</Tabs.Content>
					</Tabs.Root>
					{/* <div className="pt-[8px]">
						<div className=" bg-white-800/10 text-white-800 rounded-[4px] px-[12px] py-[8px] text-[12px] flex flex-col gap-[4px]">
							<p>
								To use the GitHub Tool, you need a Personal Access Token (PAT):
							</p>
							<ul className="list-disc list-inside">
								<li>
									Choose an existing PAT from your secrets or create a new one.
								</li>
								<li>
									To create a new PAT, click "Create new Secret" and obtain your
									token from GitHub's settings page.
									<a
										href="https://github.com/settings/personal-access-tokens"
										className="inline-flex items-center"
										target="_blank"
										rel="noreferrer"
									>
										<MoveUpRightIcon className="size-[12px] ml-[4px]" />
									</a>
								</li>
								<li>
									Enter your PAT in the field below and press enter to activate
									the GitHub Tools.
								</li>
							</ul>
						</div>
						<label htmlFor="auth-token">Auth Token</label>
						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								className={clsx(
									"flex items-center cursor-pointer p-[10px] rounded-[8px]",
									"border border-black-200 hover:border-white-400 hover:bg-black-400/40",
									"text-black-200 outline-none",
									"transition-colors gap-[8px]",
								)}
							>
								<span>Select from Secrets</span>
								<ChevronDownIcon className="size-[14px]" />
							</DropdownMenu.Trigger>
							<DropdownMenu.Portal>
								<DropdownMenu.Content
									className={clsx(
										"py-[8px]",
										"rounded-[8px] border-[1px] border-white-800 bg-black-900/20 backdrop-blur-[8px]",
									)}
									sideOffset={4}
								>
									<DropdownMenu.Item
										className={clsx(
											"group flex p-[8px] justify-between rounded-[8px] hover:bg-black-400/50 transition-colors cursor-pointer outline-none",
											"text-white-400",
											"data-[disabled]:text-white-850/30 data-[disabled]:pointer-events-none",
										)}
									>
										Create new Secret
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Portal>
						</DropdownMenu.Root>
					</div> */}
				</div>
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
