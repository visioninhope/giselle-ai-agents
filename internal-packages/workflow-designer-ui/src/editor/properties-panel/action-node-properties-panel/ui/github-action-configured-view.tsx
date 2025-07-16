import { Button } from "@giselle-internal/ui/button";
import { DropdownMenu } from "@giselle-internal/ui/dropdown-menu";
import type {
	ConnectionId,
	GitHubActionCommandConfiguredState,
	Input,
	Node,
	NodeId,
	NodeLike,
	OutputId,
} from "@giselle-sdk/data-type";
import { githubActionIdToLabel } from "@giselle-sdk/flow";
import {
	defaultName,
	useFeatureFlag,
	useGiselleEngine,
	useWorkflowDesigner,
} from "@giselle-sdk/giselle-engine/react";
import clsx from "clsx/lite";
import { PlusIcon, TriangleAlert, XIcon } from "lucide-react";
import { DropdownMenu as RadixDropdownMenu } from "radix-ui";
import { useCallback, useMemo } from "react";
import useSWR from "swr";
import { GitHubRepositoryBlock } from "../../trigger-node-properties-panel/ui";
import { type InputWithConnectedOutput, useConnectedInputs } from "../lib";

function getNodeContentType(node: Node | NodeLike): string {
	switch (node.type) {
		case "operation":
			return node.content.type;
		case "variable":
			return node.content.type;
		default:
			return "unknown";
	}
}

export function GitHubActionConfiguredView({
	nodeId,
	inputs,
	state,
}: {
	nodeId: NodeId;
	inputs: Input[];
	state: GitHubActionCommandConfiguredState;
}) {
	const client = useGiselleEngine();
	const {
		deleteConnection,
		data: { ui },
	} = useWorkflowDesigner();
	const { isLoading, data } = useSWR(
		{
			installationId: state.installationId,
			repositoryNodeId: state.repositoryNodeId,
		},
		({ installationId, repositoryNodeId }) =>
			client.getGitHubRepositoryFullname({
				installationId,
				repositoryNodeId,
			}),
	);

	const { connectedInputs } = useConnectedInputs(nodeId, inputs);

	const handleClickRemoveButton = useCallback(
		(connectionId: ConnectionId) => () => {
			deleteConnection(connectionId);
		},
		[deleteConnection],
	);

	return (
		<div className="flex flex-col gap-[16px] p-0 px-1 overflow-y-auto">
			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Repository</p>
				<div className="px-[4px] pt-[6px]">
					{isLoading || data === undefined ? (
						<p>Loading...</p>
					) : (
						<GitHubRepositoryBlock
							owner={data.fullname.owner}
							repo={data.fullname.repo}
						/>
					)}
				</div>
			</div>

			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Event Type</p>
				<div className="px-[4px] py-0 w-full bg-transparent text-[14px] flex items-center">
					{githubActionIdToLabel(state.commandId)}
				</div>
			</div>

			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-[#F7F9FD]">Input Parameter</p>
				<div className="px-[4px] py-0 w-full bg-transparent text-[14px]">
					<ul className="w-full flex flex-col gap-[12px]">
						{connectedInputs.map((input) => (
							<li key={input.id}>
								<div className=" flex items-center justify-between">
									<div className="flex items-center gap-[8px]">
										<span className="text-[14px]">{input.label}</span>
										{input.isRequired && !input.connectedOutput && (
											<span className="bg-red-900/20 text-red-900 text-[12px] font-medium px-[6px] py-[1px] rounded-full">
												required
											</span>
										)}
									</div>
									{input.connectedOutput ? (
										<div
											className={clsx(
												"group inline-flex items-center border px-[4px] py-[2px] rounded-[4px] transition-colors text-[12px] gap-[4px]",
												"data-[content-type=textGeneration]:bg-primary-900/20 data-[content-type=textGeneration]:border-primary-900/40 data-[content-type=textGeneration]:text-primary-900",
												"data-[content-type=github]:bg-github-node-1/20 data-[content-type=github]:border-github-node-1/40 data-[content-type=github]:text-github-node-1",
												"data-[content-type=text]:bg-node-plaintext-900/20 data-[content-type=text]:border-node-plaintext-900/40 data-[content-type=text]:text-node-plaintext-900",
												"data-[content-type=file]:bg-node-data-900/20 data-[content-type=file]:border-node-data-900/40 data-[content-type=file]:text-node-data-900",
												"data-[content-type=webPage]:bg-node-data-900/20 data-[content-type=webPage]:border-node-data-900/40 data-[content-type=webPage]:text-node-data-900",
												"data-[content-type=action]:bg-action-node-1/20 data-[content-type=action]:border-action-node-1/40 data-[content-type=action]:text-action-node-1",
												"data-[content-type=trigger]:bg-trigger-node-1/20 data-[content-type=trigger]:border-trigger-node-1/40 data-[content-type=trigger]:text-trigger-node-1",
												"data-[content-type=query]:bg-query-node-1/20 data-[content-type=query]:border-query-node-1/40 data-[content-type=query]:text-query-node-1",
												"data-[content-type=imageGeneration]:bg-image-generation-node-1/20 data-[content-type=imageGeneration]:border-image-generation-node-1/40 data-[content-type=imageGeneration]:text-image-generation-node-1",
												"border-transparent",
											)}
											data-content-type={getNodeContentType(
												input.connectedOutput.node,
											)}
										>
											<span className="truncate">
												{defaultName(input.connectedOutput.node as Node)} /{" "}
												{input.connectedOutput.label}
											</span>
											<button
												type="button"
												className="opacity-60 hover:opacity-100 transition-opacity"
												onClick={handleClickRemoveButton(
													input.connectedOutput.connectionId,
												)}
											>
												<XIcon className="size-[10px]" />
											</button>
										</div>
									) : (
										<SelectOutputPopover nodeId={nodeId} input={input} />
									)}
								</div>
								{ui.nodeState[nodeId]?.showError &&
									input.isRequired &&
									input.connectedOutput === undefined && (
										<div className="flex justify-end">
											<div className="text-red-900 flex items-center gap-[4px]">
												<TriangleAlert className="size-[14px]" />
												<span>Please choose a source</span>
											</div>
										</div>
									)}
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}

type OutputWithDetails = {
	id: OutputId;
	label: string;
	node: Node;
};

function SelectOutputPopover({
	nodeId,
	input,
}: {
	nodeId: NodeId;
	input: InputWithConnectedOutput;
}) {
	const { data, addConnection, isSupportedConnection } = useWorkflowDesigner();

	const node = useMemo(
		() => data.nodes.find((n) => n.id === nodeId),
		[data.nodes, nodeId],
	);

	const groupedOutputs = useMemo(() => {
		const textGeneratorNodes: OutputWithDetails[] = [];
		const textNodes: OutputWithDetails[] = [];
		const fileNodes: OutputWithDetails[] = [];
		const actionNodes: OutputWithDetails[] = [];
		const triggerNodes: OutputWithDetails[] = [];
		const githubNodes: OutputWithDetails[] = [];
		const otherNodes: OutputWithDetails[] = [];

		if (node === undefined) {
			return [];
		}

		for (const currentNode of data.nodes) {
			if (currentNode.id === nodeId) {
				continue;
			}

			// Check if this node can connect to our action node
			const { canConnect } = isSupportedConnection(currentNode, node);
			if (!canConnect) {
				continue; // Skip unsupported connections
			}

			for (const output of currentNode.outputs) {
				const outputWithDetails = { ...output, node: currentNode as Node };

				// Categorize by node type
				if (currentNode.type === "operation") {
					switch (currentNode.content.type) {
						case "textGeneration":
							textGeneratorNodes.push(outputWithDetails);
							break;
						case "action":
							actionNodes.push(outputWithDetails);
							break;
						case "trigger":
							triggerNodes.push(outputWithDetails);
							break;
						default:
							otherNodes.push(outputWithDetails);
							break;
					}
				} else if (currentNode.type === "variable") {
					switch (currentNode.content.type) {
						case "text":
							textNodes.push(outputWithDetails);
							break;
						case "file":
							fileNodes.push(outputWithDetails);
							break;
						case "github":
							githubNodes.push(outputWithDetails);
							break;
						default:
							otherNodes.push(outputWithDetails);
							break;
					}
				} else {
					otherNodes.push(outputWithDetails);
				}
			}
		}

		return [
			{ label: "Text Generator", nodes: textGeneratorNodes },
			{ label: "Action", nodes: actionNodes },
			{ label: "Trigger", nodes: triggerNodes },
			{ label: "Text", nodes: textNodes },
			{ label: "File", nodes: fileNodes },
			{ label: "GitHub", nodes: githubNodes },
			{ label: "Other", nodes: otherNodes },
		].filter((group) => group.nodes.length > 0);
	}, [data.nodes, nodeId, node, isSupportedConnection]);

	const handleSelectOutput = useCallback(
		(outputNode: Node, outputId: OutputId) => {
			if (node === undefined) {
				return;
			}
			addConnection({
				outputNode,
				outputId,
				inputNode: node,
				inputId: input.id,
			});
		},
		[node, addConnection, input],
	);

	const { layoutV2 } = useFeatureFlag();
	if (layoutV2) {
		return (
			<DropdownMenu
				trigger={
					<Button leftIcon={<PlusIcon className="size-[12px]" />}>
						Select Source
					</Button>
				}
				items={groupedOutputs.map((groupedOutput) => ({
					groupId: groupedOutput.label,
					groupLabel: groupedOutput.label,
					items: groupedOutput.nodes,
				}))}
				renderItem={(item) => (
					<p className="text-[12px] truncate">
						{item.node.name ?? defaultName(item.node)} / {item.label}
					</p>
				)}
				onSelect={(_event, item) => handleSelectOutput(item.node, item.id)}
			/>
		);
	}

	return (
		<RadixDropdownMenu.Root>
			<RadixDropdownMenu.Trigger
				className={clsx(
					"flex items-center cursor-pointer p-[10px] rounded-[8px]",
					"border border-transparent hover:border-white-800",
					"text-[12px] font-[700] text-white-800",
					"transition-colors",
				)}
			>
				<PlusIcon className="size-[12px]" />
				<p>Select Source</p>
			</RadixDropdownMenu.Trigger>
			<RadixDropdownMenu.Portal>
				<RadixDropdownMenu.Content
					className={clsx(
						"relative w-[300px] max-h-[250px] py-[8px]",
						"rounded-[8px] border-[1px] bg-black-900/60 backdrop-blur-[8px]",
						"shadow-[-2px_-1px_0px_0px_rgba(0,0,0,0.1),1px_1px_8px_0px_rgba(0,0,0,0.25)]",
					)}
					align="end"
				>
					<div
						className={clsx(
							"absolute z-0 rounded-[8px] inset-0 border-[1px] mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent",
							"from-[hsl(232,_36%,_72%)]/40 to-[hsl(218,_58%,_21%)]/90",
						)}
					/>
					<div className="relative flex flex-col max-h-[230px]">
						<div className="flex flex-col pb-[8px] gap-[8px] overflow-y-auto">
							{groupedOutputs.map((groupedOutput) =>
								groupedOutput.nodes.length === 0 ? null : (
									<RadixDropdownMenu.Group
										className="flex flex-col px-[8px]"
										key={groupedOutput.label}
									>
										<RadixDropdownMenu.Label className="py-[4px] px-[8px] text-[#505D7B] text-[10px] font-[700]">
											{groupedOutput.label}
										</RadixDropdownMenu.Label>
										{groupedOutput.nodes.map((output) => (
											<RadixDropdownMenu.Item
												key={output.id}
												className={clsx(
													"group flex p-[8px] justify-between rounded-[8px] hover:bg-primary-900/50 transition-colors cursor-pointer",
													"text-white-400",
													"data-[disabled]:text-white-850/30 data-[disabled]:pointer-events-none",
												)}
												textValue={output.id}
												onSelect={() =>
													handleSelectOutput(output.node, output.id)
												}
											>
												<p className="text-[12px] truncate">
													{defaultName(output.node)} / {output.label}
												</p>
											</RadixDropdownMenu.Item>
										))}
									</RadixDropdownMenu.Group>
								),
							)}
						</div>
					</div>
				</RadixDropdownMenu.Content>
			</RadixDropdownMenu.Portal>
		</RadixDropdownMenu.Root>
	);
}
