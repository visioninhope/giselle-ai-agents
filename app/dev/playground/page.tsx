"use client";

import {
	Background,
	Panel,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import { type FC, useEffect } from "react";
import "@xyflow/react/dist/style.css";
import { useContextMenu } from "@/app/agents/canvas/hooks";
import { Finder, GiselleNode, portDirection } from "@/app/nodes";
import { GraphProvider, useGraph } from "./graph-context";
import { PropertyPanel } from "./property-panel";

export default function Playground() {
	return (
		<GraphProvider
			initialGraph={{
				nodes: [],
				edges: [],
			}}
		>
			<ReactFlowProvider>
				<Inner />
			</ReactFlowProvider>
		</GraphProvider>
	);
}
const nodeTypes = {
	giselle: GiselleNode,
};

const Inner: FC = () => {
	const { isVisible, contextMenuPosition, hideContextMenu, handleContextMenu } =
		useContextMenu();
	const reactFlowInstance = useReactFlow<GiselleNode>();
	const { graph, dispatch } = useGraph();
	useEffect(() => {
		reactFlowInstance.setNodes(
			graph.nodes.map((node) => ({
				id: node.id,
				type: "giselle",
				data: {
					...node.data,
					className: node.className,
					sourcePorts: node.ports.filter(
						(port) => port.direction === portDirection.source,
					),
					targetPorts: node.ports.filter(
						(port) => port.direction === portDirection.target,
					),
				},
				position: node.position,
			})),
		);
	}, [reactFlowInstance.setNodes, graph]);
	return (
		<div className="h-screen w-full">
			<ReactFlow
				onContextMenu={handleContextMenu}
				nodeTypes={nodeTypes}
				defaultNodes={[]}
				defaultEdges={[]}
			>
				<Background />
				{isVisible && reactFlowInstance && (
					<Finder
						className="z-10 absolute"
						style={{
							left: contextMenuPosition.x,
							top: contextMenuPosition.y,
						}}
						onSelect={(node) => {
							hideContextMenu();
							dispatch({
								type: "ADD_NODE",
								node: {
									...node,
									position: reactFlowInstance.screenToFlowPosition({
										x: contextMenuPosition.x,
										y: contextMenuPosition.y,
									}),
								},
							});
						}}
					/>
				)}
				<Panel>
					<div className="flex gap-2 h-full">
						<PropertyPanel />
					</div>
				</Panel>
			</ReactFlow>
		</div>
	);
};
