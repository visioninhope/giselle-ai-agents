import type { GitHubTool, TextGenerationNode } from "@giselle-sdk/data-type";
import { useWorkflowDesigner } from "giselle-sdk/react";
import { useEffect } from "react";
import { GitHubIcon } from "../../../../icons";
import { Switch } from "../../../../ui/switch";

const GITHUB_TOOL_CATEGORIES = [
	{
		label: "Repository",
		tools: [
			"createRepository",
			"forkRepository",
			"getFileContents",
			"searchCode",
		],
	},
	{
		label: "Issues",
		tools: [
			"createIssue",
			"getIssue",
			"listIssues",
			"searchIssues",
			"updateIssue",
			"addIssueComment",
			"getIssueComments",
		],
	},
	{
		label: "Pull Requests",
		tools: [
			"createPullRequest",
			"getPullRequest",
			"listPullRequests",
			"getPullRequestComments",
			"getPullRequestFiles",
			"getPullRequestReviews",
			"getPullRequestStatus",
			"createPullRequestReview",
			"mergePullRequest",
			"updatePullRequestBranch",
		],
	},
	{
		label: "Code Management",
		tools: [
			"createBranch",
			"createOrUpdateFile",
			"listCommits",
			"listCodeScanningAlerts",
			"getCodeScanningAlert",
		],
	},
	{
		label: "Search",
		tools: ["searchCode", "searchIssues", "searchRepositories", "searchUsers"],
	},
	{
		label: "User",
		tools: ["getMe"],
	},
];

export function GitHubToolsPanel({ node }: { node: TextGenerationNode }) {
	const { updateNodeDataContent } = useWorkflowDesigner();

	const toolsEnabled = !!node.content.tools?.github;
	const selectedTools = node.content.tools?.github?.tools || [];
	const repositoryNodeId = node.content.tools?.github?.repositoryNodeId || "";

	const handleToggleTools = () => {
		if (toolsEnabled) {
			// Disable GitHub tools
			updateNodeDataContent(node, {
				...node.content,
				tools: {
					...node.content.tools,
					github: undefined,
				},
			});
		} else {
			// Enable GitHub tools with default empty configuration
			updateNodeDataContent(node, {
				...node.content,
				tools: {
					...node.content.tools,
					github: {
						type: "github",
						repositoryNodeId: "",
						tools: [],
					},
				},
			});
		}
	};

	const handleRepositoryChange = (value: string) => {
		if (!node.content.tools?.github) return;

		updateNodeDataContent(node, {
			...node.content,
			tools: {
				...node.content.tools,
				github: {
					...node.content.tools.github,
					repositoryNodeId: value,
				},
			},
		});
	};

	const handleToolToggle = (toolName: string) => {
		if (!node.content.tools?.github) return;

		const tools = selectedTools.includes(toolName)
			? selectedTools.filter((t) => t !== toolName)
			: [...selectedTools, toolName];

		updateNodeDataContent(node, {
			...node.content,
			tools: {
				...node.content.tools,
				github: {
					...node.content.tools.github,
					tools,
				},
			},
		});
	};

	const handleSelectAll = (category: string) => {
		if (!node.content.tools?.github) return;

		const categoryTools =
			GITHUB_TOOL_CATEGORIES.find((cat) => cat.label === category)?.tools || [];

		// Find tools that aren't already selected
		const toolsToAdd = categoryTools.filter(
			(tool) => !selectedTools.includes(tool),
		);

		if (toolsToAdd.length === 0) {
			// All tools in this category are already selected, deselect them all
			const newTools = selectedTools.filter(
				(tool) => !categoryTools.includes(tool),
			);

			updateNodeDataContent(node, {
				...node.content,
				tools: {
					...node.content.tools,
					github: {
						...node.content.tools.github,
						tools: newTools,
					},
				},
			});
		} else {
			// Add tools that aren't already selected
			const newTools = [...selectedTools, ...toolsToAdd];

			updateNodeDataContent(node, {
				...node.content,
				tools: {
					...node.content.tools,
					github: {
						...node.content.tools.github,
						tools: newTools,
					},
				},
			});
		}
	};

	// Get all repositories connected as sources to show in the dropdown
	const { data } = useWorkflowDesigner();
	const repositories = data.nodes
		.filter((n) => n.content.type === "github")
		.map((n) => ({
			id: n.id,
			name: n.name,
		}));

	useEffect(() => {}, []);

	return (
		<div className="flex flex-col gap-[24px]">
			<div className="flex items-center gap-[8px]">
				<GitHubIcon className="size-[20px] text-white-900" />
				<div className="text-[14px]">GitHub Tools</div>
				<div className="flex-1" />
				<button
					type="button"
					className={`px-3 py-1 text-sm rounded-md ${
						toolsEnabled
							? "bg-white-900 text-black-900"
							: "border border-white-900/60 text-white-900"
					}`}
					onClick={handleToggleTools}
				>
					{toolsEnabled ? "Enabled" : "Disabled"}
				</button>
			</div>

			{toolsEnabled && (
				<div>
					<div className="mb-[8px] text-[14px]">Available Tools</div>
					<div className="flex flex-col gap-[16px] max-h-[300px] overflow-y-auto pr-[8px]">
						{GITHUB_TOOL_CATEGORIES.map((category) => (
							<div key={category.label} className="flex flex-col gap-[8px]">
								<div className="flex items-center justify-between">
									<div className="text-[13px] font-medium">
										{category.label}
									</div>
									<button
										type="button"
										className="text-xs py-1 px-2 hover:bg-black-800/30 rounded"
										onClick={() => handleSelectAll(category.label)}
									>
										{category.tools.every((tool) =>
											selectedTools.includes(tool),
										)
											? "Deselect All"
											: "Select All"}
									</button>
								</div>
								<div className="grid grid-cols-2 gap-[8px]">
									{category.tools.map((tool) => (
										<div
											key={tool}
											className="flex items-center space-x-2 p-[4px] hover:bg-black-800/30 rounded-[4px]"
										>
											<Switch
												label={tool}
												name={`tool-${tool}`}
												checked={selectedTools.includes(tool)}
												onCheckedChange={() => handleToolToggle(tool)}
											/>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
