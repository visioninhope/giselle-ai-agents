import {
	type Connection,
	type GitHubActionCommandCofiguredState,
	type Input,
	type Node,
	type NodeId,
	type OutputId,
	isTextGenerationNode,
	isTextNode,
} from "@giselle-sdk/data-type";
import { githubActionIdToLabel, githubActions } from "@giselle-sdk/flow";
import clsx from "clsx/lite";
import { useGiselleEngine, useWorkflowDesigner } from "giselle-sdk/react";
import { CheckIcon } from "lucide-react";
import { Popover, ToggleGroup } from "radix-ui";
import {
	type ComponentProps,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import useSWR from "swr";
import { NodeIcon } from "../../../../icons/node";
import { defaultName } from "../../../../utils";
import { GitHubRepositoryBlock } from "../../ui";
import type { InputWithConnectedOutput } from "../lib";

export function GitHubActionConfiguredView({
	nodeId,
	inputs,
	state,
}: {
	nodeId: NodeId;
	inputs: Input[];
	state: GitHubActionCommandCofiguredState;
}) {
	const client = useGiselleEngine();
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

	const action = useMemo(
		() =>
			githubActions.find(
				(githubAction) => githubAction.command.id === state.commandId,
			),
		[state.commandId],
	);

	if (action === undefined) {
		throw new Error(`Action with id ${state.commandId} not found`);
	}

	const { data: workflow } = useWorkflowDesigner();
	const parameters = useMemo(() => {
		const tmp: InputWithConnectedOutput[] = [];
		const connectionsToThisNode = workflow.connections.filter(
			(connection) => connection.inputNode.id === nodeId,
		);
		for (const input of inputs) {
			const connectedConnection = connectionsToThisNode.find(
				(connection) => connection.inputId === input.id,
			);
			const connectedNode = workflow.nodes.find(
				(node) => node.id === connectedConnection?.outputNode.id,
			);
			const connectedOutput = connectedNode?.outputs.find(
				(output) => output.id === connectedConnection?.outputId,
			);
			if (connectedNode === undefined || connectedOutput === undefined) {
				tmp.push(input);
				continue;
			}
			tmp.push({
				...input,
				connectedOutput: {
					...connectedOutput,
					node: connectedNode,
				},
			});
		}
		return tmp;
	}, [inputs, nodeId, workflow]);

	return (
		<div className="flex flex-col gap-[17px] p-0">
			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-white-400">Repository</p>
				<div className="px-[12px] pt-[6px]">
					{isLoading || data === undefined ? (
						<p>loading...</p>
					) : (
						<GitHubRepositoryBlock
							owner={data.fullname.owner}
							repo={data.fullname.repo}
						/>
					)}
				</div>
			</div>

			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-white-400">Event Type</p>
				<div className="px-[16px] py-[9px] w-full bg-transparent text-[14px]">
					{githubActionIdToLabel(state.commandId)}
				</div>
			</div>

			<div className="space-y-[4px]">
				<p className="text-[14px] py-[1.5px] text-white-400">Parameter</p>
				<div className="px-[16px] py-[9px] w-full bg-transparent text-[14px]">
					<ul className="w-full border-collapse divide-y divide-black-400">
						{parameters.map((parameter) => (
							<li
								key={parameter.id}
								className="py-[12px] flex items-center justify-between"
							>
								<div className="flex items-center gap-[4px]">
									<p className="text-[16px]">{parameter.label}</p>
									{parameter.isRequired ? (
										<span
											className={clsx(
												"px-2 py-0.5 rounded text-[12px]",
												parameter.connectedOutput === undefined
													? "bg-red-950/30 text-red-400 border border-red-500/30"
													: "bg-slate-800 text-slate-300",
											)}
										>
											Required
										</span>
									) : (
										<span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-400">
											Optional
										</span>
									)}
								</div>
								{parameter.connectedOutput ? (
									<div className="flex items-center border border-black-400 px-[12px] py-[8px] rounded-[4px] gap-[4px]">
										<NodeIcon
											node={parameter.connectedOutput.node}
											className="size-[14px]"
										/>
										<span>{defaultName(parameter.connectedOutput.node)}</span>
										<span>/</span>
										<span>{parameter.connectedOutput.label}</span>
									</div>
								) : (
									<div className="flex-end">
										<SelectOutputPopover
											nodeId={nodeId}
											parameter={parameter}
											workflow={workflow}
										/>
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
	connection?: {
		inputNode: { id: NodeId };
		outputNode: { id: NodeId };
		inputId: string;
		outputId: string;
	};
};

function OutputToggleItem({
	output,
	disabled = false,
}: { output: OutputWithDetails; disabled?: boolean }) {
	return (
		<Popover.Close asChild>
			<ToggleGroup.Item
				key={output.id}
				className={clsx(
					"group flex p-[8px] justify-between rounded-[8px] hover:bg-primary-900/50 transition-colors cursor-pointer",
					"text-white-400",
					"data-[disabled]:text-white-850/30 data-[disabled]:pointer-events-none",
				)}
				value={output.id}
				disabled={disabled}
			>
				<p className="text-[12px] truncate">
					{defaultName(output.node)} / {output.label}
				</p>
				<CheckIcon className="w-[16px] h-[16px] hidden group-data-[state=on]:block" />
				<div
					className={clsx(
						"px-[10px] py-[4px] flex items-center justify-center rounded-[30px]",
						"bg-black-200/20 text-black-200/20 text-[10px]",
						"hidden group-data-[disabled]:block",
					)}
				>
					Unsupported
				</div>
			</ToggleGroup.Item>
		</Popover.Close>
	);
}

function SelectOutputPopover({
	nodeId,
	parameter,
	workflow,
	contentProps,
}: {
	nodeId: NodeId;
	parameter: InputWithConnectedOutput;
	workflow: { nodes: Node[]; connections: Connection[] };
	contentProps?: Omit<
		ComponentProps<typeof Popover.PopoverContent>,
		"className"
	>;
}) {
	const [selectedOutputId, setSelectedOutputId] = useState<OutputId | null>(
		parameter.connectedOutput
			? (parameter.connectedOutput.id as OutputId)
			: null,
	);
	const { isSupportedConnection } = useWorkflowDesigner();

	// Get target node from context
	const node = useMemo(
		() => workflow.nodes.find((n) => n.id === nodeId),
		[workflow.nodes, nodeId],
	);

	// Get available outputs from all nodes
	const availableOutputs = useMemo(() => {
		if (!node) return [];

		const outputs: OutputWithDetails[] = [];

		for (const sourceNode of workflow.nodes) {
			if (sourceNode.id === nodeId) continue; // Skip self

			if (sourceNode.outputs) {
				for (const output of sourceNode.outputs) {
					// Find if this output is already connected to this input
					const connection = workflow.connections.find(
						(conn) =>
							conn.outputNode.id === sourceNode.id &&
							conn.outputId === output.id &&
							conn.inputNode.id === nodeId &&
							conn.inputId === parameter.id,
					);

					outputs.push({
						id: output.id as OutputId,
						label: output.label,
						node: sourceNode,
						connection,
					});
				}
			}
		}

		return outputs;
	}, [workflow, nodeId, parameter.id, node]);

	// Group outputs by node type
	const groupedOutputs = useMemo(() => {
		const textNodes: OutputWithDetails[] = [];
		const generatedNodes: OutputWithDetails[] = [];

		for (const output of availableOutputs) {
			if (isTextGenerationNode(output.node)) {
				generatedNodes.push(output);
			} else if (isTextNode(output.node)) {
				textNodes.push(output);
			}
		}

		return { textNodes, generatedNodes };
	}, [availableOutputs]);

	const { addConnection, deleteConnection } = useWorkflowDesigner();

	const handleValueChange = useCallback(
		(selectedValue: string) => {
			if (!selectedValue || selectedValue === "") {
				// When deselected, remove any existing connection
				const existingConnection = workflow.connections.find(
					(conn) =>
						conn.inputNode.id === nodeId && conn.inputId === parameter.id,
				);

				if (existingConnection) {
					deleteConnection(existingConnection.id);
				}
				return;
			}

			const outputId = selectedValue as OutputId;
			const selectedOutput = availableOutputs.find(
				(output) => output.id === outputId,
			);

			if (!selectedOutput) return;

			// Remove any existing connection for this input
			const existingConnection = workflow.connections.find(
				(conn) => conn.inputNode.id === nodeId && conn.inputId === parameter.id,
			);

			if (existingConnection) {
				deleteConnection(existingConnection.id);
			}

			// Add the new connection
			// addConnection({
			// 	outputNode: { id: selectedOutput.node.id },
			// 	outputId: selectedOutput.id,
			// 	inputNode: { id: nodeId },
			// 	inputId: parameter.id,
			// });
		},
		[
			nodeId,
			parameter.id,
			workflow.connections,
			availableOutputs,
			addConnection,
			deleteConnection,
		],
	);

	return (
		<Popover.Root>
			<Popover.Trigger
				className={clsx(
					"flex items-center cursor-pointer p-[10px] rounded-[8px]",
					"border border-transparent hover:border-white-800",
					"text-[12px] font-[700] text-white-800",
					"transition-colors",
				)}
			>
				Select Source
			</Popover.Trigger>
			<Popover.Anchor />
			<Popover.Portal>
				<Popover.Content
					className={clsx(
						"relative w-[300px] py-[8px]",
						"rounded-[8px] border-[1px] bg-black-900/60 backdrop-blur-[8px]",
						"shadow-[-2px_-1px_0px_0px_rgba(0,0,0,0.1),1px_1px_8px_0px_rgba(0,0,0,0.25)]",
					)}
					align="end"
					{...contentProps}
				>
					<div
						className={clsx(
							"absolute z-0 rounded-[8px] inset-0 border-[1px] mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent",
							"from-[hsl(232,_36%,_72%)]/40 to-[hsl(218,_58%,_21%)]/90",
						)}
					/>
					<ToggleGroup.Root
						type="single"
						className="relative max-h-[300px] flex flex-col"
						value={selectedOutputId ?? ""}
						onValueChange={handleValueChange}
					>
						<div className="flex px-[16px] text-white-900">
							Select Source For {parameter.label}
						</div>
						<div className="flex flex-col py-[4px]">
							<div className="border-t border-black-300/20" />
						</div>
						<div className="grow flex flex-col pb-[8px] gap-[8px] overflow-y-auto min-h-0">
							{groupedOutputs.generatedNodes.length > 0 && (
								<div className="flex flex-col px-[8px]">
									<p className="py-[4px] px-[8px] text-black-400 text-[10px] font-[700]">
										Generated Content
									</p>
									{groupedOutputs.generatedNodes.map((output) => (
										<OutputToggleItem key={output.id} output={output} />
									))}
								</div>
							)}
							{groupedOutputs.textNodes.length > 0 && (
								<div className="flex flex-col px-[8px]">
									<p className="py-[4px] px-[8px] text-black-400 text-[10px] font-[700]">
										Text
									</p>
									{groupedOutputs.textNodes.map((output) => (
										<OutputToggleItem key={output.id} output={output} />
									))}
								</div>
							)}
						</div>
					</ToggleGroup.Root>
				</Popover.Content>
			</Popover.Portal>
		</Popover.Root>
	);
}
