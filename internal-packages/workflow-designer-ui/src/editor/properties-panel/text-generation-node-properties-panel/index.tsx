import {
	type Node,
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
	const sourceNodes = useMemo(
		() =>
			node.content.sources
				.map((source) =>
					data.nodes.find((node) => node.id === source.connectedNodeId),
				)
				.filter((node) => node !== undefined),
		[data, node.content.sources],
	);
	const addSource = useCallback(
		(sourceNode: Node) => {
			const connectionHandle = createConnectionHandle({
				label: "Source",
				nodeId: node.id,
				nodeType: node.type,
				connectedNodeId: sourceNode.id,
			});
			addConnection(sourceNode, connectionHandle);
			connectionHandle;
			updateNodeDataContent(node, {
				sources: [...node.content.sources, connectionHandle],
			});
		},
		[addConnection, node, updateNodeDataContent],
	);

	const removeSource = useCallback(
		(removeSourceNode: Node) => {
			for (const connection of data.connections) {
				if (
					connection.sourceNodeId !== removeSourceNode.id ||
					connection.targetNodeId !== node.id
				) {
					continue;
				}
				deleteConnection(connection.id);
				updateNodeDataContent(node, {
					sources: node.content.sources.filter(
						({ id }) => id !== connection.targetNodeHandleId,
					),
				});
				break;
			}
		},
		[deleteConnection, data, node, updateNodeDataContent],
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
								sourceNodes,
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
									sourceNodes={sourceNodes}
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
									sourceNodes={sourceNodes}
									connectableNodes={connectableNodes}
									addSource={addSource}
									removeSource={removeSource}
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

// export function TextGenerationNodePropertiesPanelOld({
// 	node,
// }: {
// 	node: TextGenerationNode;
// }) {
// 	const { setPropertiesTab, data } = useWorkflowDesigner();
// 	const { startGeneration } = useGenerationCont``
// 	const { generations } = useNodeGenerations({
// 		nodeId: node.id,
// 		origin: { type: "workspace", id: data.id },
// 	});
// 	const [currentGeneration, setCurrentGeneration] = useState<
// 		Generation | undefined
// 	>();

// 	useEffect(() => {
// 		if (generations.length === 0) {
// 			setCurrentGeneration(undefined);
// 		} else {
// 			const latestGeneration = generations[generations.length - 1];
// 			setCurrentGeneration(latestGeneration);
// 		}
// 	}, [generations]);

// 	const setPrevGeneration = useCallback(() => {
// 		const currentGenerationIndex = generations.findIndex(
// 			(generation) => generation.id === currentGeneration?.id,
// 		);
// 		const previousGeneration = generations[currentGenerationIndex - 1];
// 		setCurrentGeneration(previousGeneration);
// 	}, [generations, currentGeneration]);

// 	const setNextGeneration = useCallback(() => {
// 		const currentGenerationIndex = generations.findIndex(
// 			(generation) => generation.id === currentGeneration?.id,
// 		);
// 		const nextGeneration = generations[currentGenerationIndex + 1];
// 		setCurrentGeneration(nextGeneration);
// 	}, [generations, currentGeneration]);
// 	const handleSubmit = useCallback(
// 		(event: FormEvent<HTMLFormElement>) => {
// 			event.preventDefault();
// 			startGeneration({
// 				origin: {
// 					type: "workspace",
// 					id: data.id,
// 				},
// 				actionNode: node,
// 				sourceNodes: node.content.sources
// 					.map((source) =>
// 						data.nodes.find((node) => node.id === source.connectedNodeId),
// 					)
// 					.filter((sourceNode) => sourceNode !== undefined),
// 			});
// 			setPropertiesTab("Result");
// 		},
// 		[startGeneration, node, setPropertiesTab, data],
// 	);
// 	return (
// 		<Tabs>
// 			<TabsList>
// 				<TabsTrigger value="Prompt">Prompt</TabsTrigger>
// 				<TabsTrigger value="Result">Result</TabsTrigger>
// 			</TabsList>
// 			<PropertiesPanelTitle
// 				node={node}
// 				action={
// 					<form onSubmit={handleSubmit}>
// 						<button
// 							type="submit"
// 							className="relative z-10 rounded-[8px] shadow-[0px_0px_3px_0px_#FFFFFF40_inset] py-[3px] px-[8px] bg-black-80 text-black-30 font-rosart text-[14px] disabled:bg-black-40"
// 						>
// 							Generate
// 						</button>
// 					</form>
// 				}
// 			/>
// 			<TabsContent value="Prompt">
// 				<TabsContentPrompt node={node} />
// 			</TabsContent>
// 			<TabsContent value="Result">
// 				{currentGeneration === undefined ? (
// 					"No generation"
// 				) : (
// 					<>
// 						<PropertiesPanelContentBox className="flex-1">
// 							<GenerationView generation={currentGeneration} />
// 						</PropertiesPanelContentBox>
// 						<div className="px-[10px] py-[10px]">
// 							<GenerationCursor
// 								currentGenerationId={currentGeneration?.id}
// 								generations={generations}
// 								onPrevGenerationButtonClick={setPrevGeneration}
// 								onNextGenerationButtonClick={setNextGeneration}
// 							/>
// 						</div>
// 					</>
// 				)}
// 			</TabsContent>
// 		</Tabs>
// 	);
// }
