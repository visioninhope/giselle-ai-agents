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
import {
	Finder,
	GiselleNode,
	type Node,
	type Port,
	portDirection,
} from "@/app/nodes";
import { createId } from "@paralleldrive/cuid2";
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
		reactFlowInstance.setEdges(
			graph.edges.map(
				({ id, sourceNodeId, sourcePortId, targetNodeId, targetPortId }) => ({
					id,
					source: sourceNodeId,
					sourceHandle: sourcePortId,
					target: targetNodeId,
					targetHandle: targetPortId,
				}),
			),
		);
	}, [reactFlowInstance.setNodes, reactFlowInstance.setEdges, graph]);
	return (
		<div className="h-screen w-full">
			<ReactFlow
				onContextMenu={handleContextMenu}
				nodeTypes={nodeTypes}
				defaultNodes={[] as GiselleNode[]}
				defaultEdges={[]}
				isValidConnection={({ source, sourceHandle, target, targetHandle }) => {
					const sourcePort = graph.nodes
						.find((node) => node.id === source)
						?.ports.find((port) => port.id === sourceHandle);
					const targetPort = graph.nodes
						.find((node) => node.id === target)
						?.ports.find((port) => port.id === targetHandle);
					if (sourcePort == null || targetPort == null) {
						return false;
					}
					return targetPort.type === sourcePort.type;
				}}
				onConnect={({ source, sourceHandle, target, targetHandle }) => {
					// Since validation is already performed by isValidConnection,
					// there is no need for additional validation here.
					dispatch({
						type: "ADD_EDGE",
						edge: {
							id: `ed_${createId()}`,
							sourceNodeId: source as Node["id"],
							sourcePortId: sourceHandle as Port["id"],
							targetNodeId: target as Node["id"],
							targetPortId: targetHandle as Port["id"],
						},
					});
				}}
				onNodeDragStop={(_event, _node, nodes) => {
					nodes.map((node) => {
						dispatch({
							type: "UPDATE_NODE",
							nodeId: node.id as Node["id"],
							updates: {
								position: node.position,
							},
						});
					});
				}}
				onNodesDelete={(nodes) => {
					nodes.map((node) => {
						dispatch({
							type: "REMOVE_NODE",
							nodeId: node.id as Node["id"],
						});
					});
				}}
				viewport={graph.viewport}
				onViewportChange={(viewport) => {
					dispatch({
						type: "UPDATE_VIEWPORT",
						viewport,
					});
				}}
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
