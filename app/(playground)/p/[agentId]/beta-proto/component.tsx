"use client";

import { GiselleLogo } from "@/components/giselle-logo";
import {
	Background,
	BackgroundVariant,
	Panel,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import Link from "next/link";
import { useState } from "react";
import bg from "./bg.png";
import "@xyflow/react/dist/style.css";
import { SparklesIcon } from "./components/icons/sparkles";
import { GradientPathDefinitions } from "./connector/gradient-definitions";
import {
	MousePositionProvider,
	useMousePosition,
} from "./contexts/mouse-position";
import { FeatureFlagProvider } from "./feature-flags/provider";
import type { FeatureFlags } from "./feature-flags/types";
import {
	giselleNodeArchetypes,
	promptBlueprint,
	textGeneratorParameterNames,
	webSearchBlueprint,
} from "./giselle-node/blueprints";
import {
	GiselleNode,
	GiselleNodeInformationPanel,
} from "./giselle-node/components";
import { type GiselleNodeId, panelTabs } from "./giselle-node/types";
import {
	addNodesAndConnect,
	selectNode,
	selectNodeAndSetPanelTab,
} from "./graph/actions";
import { useGraph } from "./graph/context";
import { GraphProvider } from "./graph/provider";
import type { Graph } from "./graph/types";
import {
	type ReactFlowNode,
	edgeTypes,
	nodeTypes,
} from "./react-flow-adapter/giselle-node";
import {
	useConnectionHandler,
	useGraphToReactFlowEffect,
	useKeyUpHandler,
	useNodeEventHandler,
} from "./react-flow-adapter/graph";
import { setSelectTool } from "./tool/actions";
import { Toolbar } from "./tool/components";
import { useTool } from "./tool/context";
import { ToolProvider } from "./tool/provider";
import type { AgentId } from "./types";

function Inner() {
	const [previewMode, setPreviewMode] = useState(false);
	const { state: toolState, dispatch: toolDispatch } = useTool();
	const { dispatch: graphDispatch } = useGraph();
	const reactFlowInstance = useReactFlow();
	const mousePosition = useMousePosition();
	useGraphToReactFlowEffect();
	const { handleConnect } = useConnectionHandler();
	const { handleNodeDragStop } = useNodeEventHandler();
	const { handleKeyUp } = useKeyUpHandler();
	return (
		<div className="w-full h-screen">
			<ReactFlow<ReactFlowNode>
				defaultNodes={[]}
				defaultEdges={[]}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				panOnScroll
				onKeyUp={handleKeyUp}
				selectionOnDrag
				panOnDrag={false}
				colorMode="dark"
				onConnect={handleConnect}
				onNodeDragStop={handleNodeDragStop}
				onNodeClick={(_, node) => {
					graphDispatch(
						selectNodeAndSetPanelTab({
							selectNode: {
								id: node.id as GiselleNodeId,
								panelTab: panelTabs.property,
							},
						}),
					);
				}}
				onPaneClick={(event) => {
					event.preventDefault();
					graphDispatch(
						selectNode({
							selectedNodeIds: [],
						}),
					);
					if (toolState.activeTool.type === "addGiselleNode") {
						const position = reactFlowInstance.flowToScreenPosition({
							x: event.clientX,
							y: event.clientY,
						});
						if (
							toolState.activeTool.giselleNodeBlueprint.archetype ===
							giselleNodeArchetypes.textGenerator
						) {
							graphDispatch(
								addNodesAndConnect({
									sourceNode: {
										node: promptBlueprint,
										position: {
											x: position.x - 300,
											y: position.y + 100,
										},
									},
									targetNode: {
										node: toolState.activeTool.giselleNodeBlueprint,
										position,
									},
									connector: {
										targetParameterName:
											textGeneratorParameterNames.instruction,
									},
								}),
							);
						}
						if (
							toolState.activeTool.giselleNodeBlueprint.archetype ===
							giselleNodeArchetypes.webSearch
						) {
							graphDispatch(
								addNodesAndConnect({
									sourceNode: {
										node: promptBlueprint,
										position: {
											x: position.x - 300,
											y: position.y + 100,
										},
									},
									targetNode: {
										node: toolState.activeTool.giselleNodeBlueprint,
										position,
									},
									connector: {
										targetParameterName:
											textGeneratorParameterNames.instruction,
									},
								}),
							);
						}
						toolDispatch(setSelectTool);
					}
				}}
				deleteKeyCode={null}
			>
				<Background
					className="!bg-black-100"
					lineWidth={0}
					variant={BackgroundVariant.Lines}
					style={{
						backgroundImage: `url(${bg.src})`,
						backgroundPositionX: "center",
						backgroundPositionY: "center",
						backgroundSize: "cover",
					}}
				/>
				{toolState.activeTool.type === "addGiselleNode" && (
					<div
						className="absolute"
						style={{
							left: `${mousePosition.x - 0}px`,
							top: `${mousePosition.y - 0}px`,
						}}
					>
						<GiselleNode {...toolState.activeTool.giselleNodeBlueprint} />
					</div>
				)}

				<Panel position={"bottom-center"}>
					<Toolbar />
				</Panel>
				<Panel position="top-left" className="!top-0 !left-0 !right-0 !m-0">
					<div className="h-[60px] flex items-center justify-between mx-[20px]">
						<div className="flex gap-[8px] items-center">
							<Link href="/">
								<GiselleLogo className="fill-white w-[70px] h-auto mt-[6px]" />
							</Link>
							<div className="font-rosart text-[18px] text-black--30">
								Playground
							</div>
							{/**
									<div className="flex items-center gap-[10px] group">
										<label className="w-[30px] h-[18px] border border-black-70 rounded-full relative bg-black-80 cursor-pointer group has-[:checked]:bg-black-70 ">
											<div className="absolute bg-black-100 rounded-full w-[16px] h-[16px] group-has-[:checked]:translate-x-[12px]  transition-all" />
											<input type="checkbox" name="previewMode" className="hidden" />
										</label>
										<div className="relative font-avenir h-[18px] text-[12px]">
											<div className="h-[18px] flex items-center absolute top-0 text-black--30 opacity-100 group-has-[:checked]:opacity-0 transition-opacity duration-400">
												Edit
											</div>
											<div className="h-[18px] flex items-center  absolute text-black--30 opacity-0 group-has-[:checked]:opacity-100 transition-opacity duration-400">
												Preview
											</div>
										</div>
									</div>
								 */}
						</div>
						<div>
							<button
								type="button"
								className="px-[16px] py-[8px] rounded-[8px] flex items-center gap-[2px] bg-[hsla(207,19%,77%,0.3)] font-rosart"
								style={{
									boxShadow: "0px 0px 3px 0px hsla(0, 0%, 100%, 0.25) inset",
								}}
							>
								<SparklesIcon className="w-[18px] h-[18px] fill-white drop-shadow-[0.66px_1.32px_2.64px_hsla(0,0%,100%,0.25)]" />
								<span>Run</span>
							</button>
						</div>
					</div>
				</Panel>
				<Panel position="top-right" className="!top-0 !bottom-0 !right-0 !m-0">
					<GiselleNodeInformationPanel />
				</Panel>
				{/**<Panel position="top-left" className="!top-0 !bottom-0 !left-0 !m-0">
					<div className="absolute bg-black-100 w-[380px] rounded-[16px] overflow-hidden shadow-[0px_0px_8px_0px_hsla(0,_0%,_100%,_0.2)] top-[80px] bottom-[20px] left-[20px]">
						<div className="absolute z-0 rounded-[16px] inset-0 border mask-fill bg-gradient-to-br bg-origin-border bg-clip-boarder border-transparent from-[hsla(233,4%,37%,1)] to-[hsla(233,62%,22%,1)]" />
						<div className="flex gap-[10px] flex-col h-full">
							<div className="relative z-10 pt-[16px] px-[24px] flex justify-between h-[40px]">
								hello
							</div>
						</div>
					</div>
				</Panel>**/}
			</ReactFlow>
		</div>
	);
}

interface PlaygroundProps {
	agentId: AgentId;
	graph: Graph;
	featureFlags: FeatureFlags;
}
export function Playground(props: PlaygroundProps) {
	return (
		<ReactFlowProvider>
			<FeatureFlagProvider {...props.featureFlags}>
				<MousePositionProvider>
					<ToolProvider>
						<GraphProvider agentId={props.agentId} defaultGraph={props.graph}>
							<GradientPathDefinitions />
							<Inner />
						</GraphProvider>
					</ToolProvider>
				</MousePositionProvider>
			</FeatureFlagProvider>
		</ReactFlowProvider>
	);
}
