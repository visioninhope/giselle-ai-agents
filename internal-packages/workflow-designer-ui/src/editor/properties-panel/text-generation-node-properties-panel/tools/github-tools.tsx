import type { TextGenerationNode } from "@giselle-sdk/data-type";
import { useGiselleEngine, useWorkflowDesigner } from "giselle-sdk/react";
import { CheckIcon, MoveUpRightIcon, TrashIcon } from "lucide-react";
import { GitHubIcon } from "../../../../icons";
import { Switch } from "../../../../ui/switch";

const GITHUB_TOOL_CATEGORIES = [
	{
		label: "Repository",
		tools: [
			"createRepository",
			"forkRepository",
			"getFileContents",
			"listBranches",
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
			"updatePullRequest",
			"listPullRequests",
			"searchPullRequests",
			"getPullRequestComments",
			"getPullRequestFiles",
			"getPullRequestReviews",
			"getPullRequestStatus",
			"createPullRequestReview",
			"addPullRequestReviewComment",
			"mergePullRequest",
			"updatePullRequestBranch",
		],
	},
	{
		label: "Code Management",
		tools: [
			"createBranch",
			"createOrUpdateFile",
			"getCommit",
			"listCommits",
			"listCodeScanningAlerts",
			"getCodeScanningAlert",
		],
	},
	{
		label: "Search",
		tools: [
			"searchCode",
			"searchIssues",
			"searchPullRequests",
			"searchRepositories",
			"searchUsers",
		],
	},
	{
		label: "User",
		tools: ["getMe"],
	},
];

export function GitHubToolsPanel({ node }: { node: TextGenerationNode }) {
	const { updateNodeDataContent } = useWorkflowDesigner();
	const client = useGiselleEngine();

	const toolsEnabled = !!node.content.tools?.github;
	const selectedTools = node.content.tools?.github?.tools || [];

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

	return (
		<div className="flex flex-col gap-[12px]">
			<div className="flex items-center gap-[8px]">
				<GitHubIcon className="size-[20px] text-white-900" />
				<div className="text-[14px]">GitHub Tools</div>
			</div>
			{!toolsEnabled && (
				<form
					className="bg-white-800/10 text-white-800 rounded-[4px] px-[12px] py-[8px] text-[12px] flex flex-col gap-[4px]"
					onSubmit={async (e) => {
						e.preventDefault();
						const formData = new FormData(e.currentTarget);
						const token = formData.get("token");
						if (typeof token !== "string" || token.length < 36) {
							alert("Invalid PAT");
							return;
						}
						const { encrypted } = await client.encryptSecret({
							plaintext: token,
						});

						updateNodeDataContent(node, {
							...node.content,
							tools: {
								...node.content.tools,
								github: {
									tools: [],
									auth: {
										type: "pat",
										token: encrypted,
									},
								},
							},
						});
					}}
				>
					<p>To use GitHub Tool, you need an PAT:</p>
					<ul className="list-disc list-inside">
						<li>
							Get your PAT from the GitHub settings page
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
							Paste your PAT below and hit enter to start using the GitHub Tools
						</li>
					</ul>
					<input
						type="text"
						name="token"
						className="border border-black-300 rounded-[4px] px-[4px] py-[4px] outline-none"
						placeholder="ghp_0000000000"
					/>
				</form>
			)}
			{toolsEnabled && (
				<div className="bg-white-800/10 text-white-800 rounded-[4px] px-[12px] py-[8px] text-[12px] flex flex-col">
					<div className="flex justify-between items-center">
						<div className="flex gap-[6px] items-center">
							<CheckIcon className="size-[14px] text-green-900" />
							PAT configured.
						</div>
						<button
							type="button"
							className="text-white-800 flex items-center gap-[4px] cursor-pointer p-[2px] hover:bg-white-800/20 rounded-[4px] transition-colors"
							onClick={() => {
								updateNodeDataContent(node, {
									...node.content,
									tools: {
										...node.content.tools,
										github: undefined,
									},
								});
							}}
						>
							<TrashIcon className="size-[12px]" />
							Reset key
						</button>
					</div>
					<div className="border-t border-white-800/10 my-[8px]" />

					<div>
						<div className="flex flex-col gap-[16px]">
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
				</div>
			)}
		</div>
	);
}
