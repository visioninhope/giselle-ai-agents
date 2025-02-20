import type { Node, TextGenerationNode } from "@giselle-sdk/data-type";
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
		deleteConnection,
		updateNodeData,
		setUiNodeState,
	} = useWorkflowDesigner();
	const { startGeneration } = useGenerationController();

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
									// sourceNodes={inputs.map((input) => input.node)}
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
								<SourcesPanel node={node} />
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
