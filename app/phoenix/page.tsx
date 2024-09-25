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
import { useState } from "react";
import bg from "./bg.png";
import "@xyflow/react/dist/style.css";
import {
	MousePositionProvider,
	useMousePosition,
} from "./contexts/mouse-position";
import {
	giselleNodeArchetypes,
	promptBlueprint,
	textGeneratorBlueprint,
	textGeneratorParameterNames,
} from "./giselle-node/blueprints";
import { GiselleNode } from "./giselle-node/components";
import { addNode, addNodesAndConnect } from "./graph/actions";
import { useGraph } from "./graph/context";
import { GraphProvider } from "./graph/provider";
import { nodeTypes } from "./react-flow-adapter/giselle-node";
import { useGraphToReactFlowEffect } from "./react-flow-adapter/graph";
import { setSelectTool, setTool } from "./tool/actions";
import { Toolbar } from "./tool/components";
import { useTool } from "./tool/context";
import { ToolProvider } from "./tool/provider";

function Inner() {
	const [previewMode, setPreviewMode] = useState(false);
	const { state: toolState, dispatch: toolDispatch } = useTool();
	const { dispatch: graphDispatch } = useGraph();
	const reactFlowInstance = useReactFlow();
	const mousePosition = useMousePosition();
	useGraphToReactFlowEffect();
	return (
		<div className="w-full h-screen">
			<div className="absolute z-10 left-[20px] right-[20px] top-[20px] h-[36px] flex justify-between">
				<div className="flex gap-[8px] items-center">
					<GiselleLogo className="fill-white w-[70px] h-auto mt-[6px]" />
					<div className="font-rosart text-[18px] text-black--30">
						Playground
					</div>
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
				</div>
			</div>
			<ReactFlow
				defaultNodes={[]}
				defaultEdges={[]}
				nodeTypes={nodeTypes}
				panOnScroll
				selectionOnDrag
				panOnDrag={false}
				colorMode="dark"
				onPaneClick={(event) => {
					event.preventDefault();
					const position = reactFlowInstance.flowToScreenPosition({
						x: event.clientX,
						y: event.clientY,
					});
					if (toolState.activeTool.type === "addGiselleNode") {
						if (
							toolState.activeTool.giselleNodeBlueprint.archetype ===
							giselleNodeArchetypes.textGenerator
						) {
							graphDispatch(
								addNodesAndConnect({
									sourceNode: {
										node: promptBlueprint,
										position: {
											x: position.x - 200,
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
						// graphDispatch(
						// 	addNode(toolState.activeTool.giselleNodeBlueprint, position),
						// );
						// if (
						// 	toolState.activeTool.giselleNodeBlueprint.archetype ===
						// 	giselleNodeArchetypes.textGenerator
						// ) {
						// 	graphDispatch(
						// 		addNode(promptBlueprint, {
						// 			x: position.x - 200,
						// 			y: position.y + 200,
						// 		}),
						// 	);
						// }
						toolDispatch(setSelectTool);
					}
				}}
				className={
					toolState.activeTool.type === "addGiselleNode"
						? "[&_div]:!cursor-crosshair"
						: ""
				}
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
			</ReactFlow>
		</div>
	);
}

export default function Page() {
	return (
		<ReactFlowProvider>
			<MousePositionProvider>
				<ToolProvider>
					<GraphProvider>
						<Inner />
					</GraphProvider>
				</ToolProvider>
			</MousePositionProvider>
		</ReactFlowProvider>
	);
}
