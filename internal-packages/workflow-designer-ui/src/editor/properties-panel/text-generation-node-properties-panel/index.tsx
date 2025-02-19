import {
	type InputPort,
	type Node,
	type OutputPort,
	PortId,
	type TextGenerationNode,
	createConnectionHandle,
} from "@giselle-sdk/data-type";
import clsx from "clsx/lite";
import {
	useGenerationController,
	useWorkflowDesigner,
} from "giselle-sdk/react";
import { Tabs } from "radix-ui";
import { useCallback, useMemo } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AnthropicIcon, GoogleIcon, OpenaiIcon } from "../../../icons";
import {
	PropertiesPanelContent,
	PropertiesPanelHeader,
	PropertiesPanelRoot,
} from "../ui";
import { GenerationPanel } from "./generation-panel";
import {
	AnthropicModelPanel,
	GoogleModelPanel,
	OpenAIModelPanel,
} from "./model";
import { PromptPanel } from "./prompt-panel";
import { SourcesPanel } from "./sources-panel";

export function TextGenerationNodePropertiesPanel({
	node,
}: {
	node: TextGenerationNode;
}) {
	const {
		data,
		updateNodeDataContent,
		addConnection,
		deleteConnection,
		updateNodeData,
		setUiNodeState,
	} = useWorkflowDesigner();
	const { startGeneration } = useGenerationController();

	const connectableNodes = useMemo(
		() => data.nodes.filter((_node) => _node.id !== node.id),
		[data, node.id],
	);
	const inputs = useMemo(
		() =>
			node.inputs
				.map((input) => {
					const connections = data.connections.filter(
						(connection) => connection.inputNodeId === node.id,
					);
					const inputNode = data.nodes.find((tmpNode) =>
						connections.some(
							(connection) => connection.outputNodeId === tmpNode.id,
						),
					);
					if (inputNode === undefined) {
						return undefined;
					}
					return {
						...input,
						node,
					};
				})
				.filter((node) => node !== undefined),
		[data, node],
	);
	const addInput = useCallback(
		(connectNode: Node, connectPort: OutputPort) => {
			const connectionHandle = createConnectionHandle({
				label: "Source",
			});
			const newInput: InputPort = {
				id: PortId.generate(),
				direction: "input",
				label: "Source",
			};
			addConnection({
				input: {
					node,
					port: newInput,
				},
				output: {
					node: connectNode,
					port: connectPort,
				},
			});
			updateNodeData(node, {
				inputs: [...node.inputs, newInput],
			});
		},
		[addConnection, node, updateNodeData],
	);

	const removeInput = useCallback(
		(removeInputPort: InputPort) => {
			for (const connection of data.connections) {
				if (connection.inputPortId !== removeInputPort.id) {
					continue;
				}
				deleteConnection(connection.id);
				updateNodeData(node, {
					inputs: node.inputs.filter(({ id }) => id !== connection.inputPortId),
				});
				break;
			}
		},
		[deleteConnection, data, node, updateNodeData],
	);

	const uiState = useMemo(() => data.ui.nodeState[node.id], [data, node.id]);

	return (
		<PropertiesPanelRoot>
			<PropertiesPanelHeader
				icon={
					<>
						{node.content.llm.provider === "openai" && (
							<OpenaiIcon className="size-[20px] text-black" />
						)}
						{node.content.llm.provider === "anthropic" && (
							<AnthropicIcon className="size-[20px] text-black" />
						)}
						{node.content.llm.provider === "google" && (
							<GoogleIcon className="size-[20px]" />
						)}
					</>
				}
				name={node.name}
				fallbackName={node.content.llm.model}
				description={node.content.llm.provider}
				onChangeName={(name) => {
					updateNodeData(node, { name });
				}}
				action={
					<button
						type="button"
						className="flex gap-[4px] justify-center items-center bg-blue rounded-[8px] px-[15px] py-[8px] text-white text-[14px] font-[700] cursor-pointer"
						onClick={() => {
							startGeneration({
								origin: {
									type: "workspace",
									id: data.id,
								},
								actionNode: node,
								sourceNodes: inputs.map((input) => input.node),
							});
						}}
					>
						Generate
					</button>
				}
			/>

			<PanelGroup
				direction="vertical"
				className="flex-1 flex flex-col gap-[16px]"
			>
				<Panel>
					<PropertiesPanelContent>
						<Tabs.Root
							className="flex flex-col gap-[8px] h-full"
							value={uiState?.tab ?? "prompt"}
							onValueChange={(tab) => {
								setUiNodeState(node.id, { tab }, { save: true });
							}}
						>
							<Tabs.List
								className={clsx(
									"flex gap-[16px] text-[14px]",
									"**:p-[4px] **:border-b **:cursor-pointer",
									"**:data-[state=active]:text-white **:data-[state=active]:border-white",
									"**:data-[state=inactive]:text-black-40 **:data-[state=inactive]:border-transparent",
								)}
							>
								<Tabs.Trigger value="prompt">Prompt</Tabs.Trigger>
								<Tabs.Trigger value="model">Model</Tabs.Trigger>
								<Tabs.Trigger value="sources">Sources</Tabs.Trigger>
							</Tabs.List>
							<Tabs.Content value="prompt" className="flex-1 flex flex-col">
								<PromptPanel
									prompt={node.content.prompt}
									onPromptChange={(newPrompt) => {
										updateNodeDataContent(node, {
											prompt: newPrompt,
										});
									}}
									sourceNodes={inputs.map((input) => input.node)}
								/>
								{/* <div>toolbar</div>
							<textarea
								name="prompt"
								className="flex-1 border border-white rounded-[8px] resize-none w-full p-[8px] bg-black-80 text-white text-[14px] outline-none"
								value={node.content.prompt}
								onChange={(event) => {
									updateNodeDataContent(node, {
										prompt: event.target.value,
									});
								}}
							/> */}
							</Tabs.Content>
							<Tabs.Content value="model" className="flex-1 flex flex-col">
								{node.content.llm.provider === "openai" && (
									<OpenAIModelPanel
										openai={node.content.llm}
										onModelChange={(value) =>
											updateNodeDataContent(node, {
												...node.content,
												llm: value,
											})
										}
									/>
								)}
								{node.content.llm.provider === "google" && (
									<GoogleModelPanel
										google={node.content.llm}
										onModelChange={(value) =>
											updateNodeDataContent(node, {
												...node.content,
												llm: value,
											})
										}
									/>
								)}
								{node.content.llm.provider === "anthropic" && (
									<AnthropicModelPanel
										anthropic={node.content.llm}
										onModelChange={(value) =>
											updateNodeDataContent(node, {
												...node.content,
												llm: value,
											})
										}
									/>
								)}
							</Tabs.Content>
							<Tabs.Content value="sources" className="flex-1 flex flex-col">
								<SourcesPanel
									connections={inputs.map((input) => input.node)}
									connectableNodes={connectableNodes}
									addConnection={addInput}
									removeConnection={removeInput}
								/>
							</Tabs.Content>
						</Tabs.Root>
					</PropertiesPanelContent>
				</Panel>
				<PanelResizeHandle
					className={clsx(
						"h-[1px] bg-black-40/50 transition-colors",
						"data-[resize-handle-state=hover]:bg-black-40 data-[resize-handle-state=drag]:bg-black-40",
					)}
				/>
				<Panel>
					<PropertiesPanelContent>
						<GenerationPanel node={node} />
					</PropertiesPanelContent>
				</Panel>
			</PanelGroup>
		</PropertiesPanelRoot>
	);
}
