"use client";

import {
	Background,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import { type FC, useEffect } from "react";
import "@xyflow/react/dist/style.css";
import { useContextMenu } from "@/app/agents/canvas/hooks";
import { Finder, GiselleNode } from "@/app/nodes";
import { GraphProvider, useGraph } from "./graph-context";

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
	const reactFlowInstance = useReactFlow();
	const { graph, dispatch } = useGraph();
	useEffect(() => {
		reactFlowInstance.setNodes(graph.nodes);
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
					<div
						className="z-10 absolute"
						style={{
							left: contextMenuPosition.x,
							top: contextMenuPosition.y,
						}}
					>
						<Finder
							onSelect={({ id, className, sourcePorts, targetPorts }) => {
								hideContextMenu();
								dispatch({
									type: "ADD_NODE",
									node: {
										id,
										type: "giselle",
										data: {
											className,
											sourcePorts,
											targetPorts,
										},
										position: reactFlowInstance.screenToFlowPosition({
											x: contextMenuPosition.x,
											y: contextMenuPosition.y,
										}),
									},
								});
							}}
						/>
					</div>
				)}
			</ReactFlow>
		</div>
	);
};
