"use client";

import {
	Background,
	BackgroundVariant,
	Panel,
	ReactFlow,
	ReactFlowProvider,
} from "@xyflow/react";
import bg from "./bg.png";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { GraphContextProvider, useGraph } from "../contexts/graph";
import {
	GraphSelectionContextProvider,
	useGraphSelection,
} from "../contexts/graph-selection";
import { PropertiesPanelProvider } from "../contexts/properties-panel";
import type { Graph, NodeId } from "../types";
import { Edge } from "./edge";
import { Node } from "./node";
import { PropertiesPanel } from "./properties-panel";

interface EditorProps {
	graph: Graph;
}
export function Editor(props: EditorProps) {
	return (
		<GraphContextProvider defaultGraph={props.graph}>
			<GraphSelectionContextProvider>
				<PropertiesPanelProvider>
					<ReactFlowProvider>
						<EditorInner />
					</ReactFlowProvider>
				</PropertiesPanelProvider>
			</GraphSelectionContextProvider>
		</GraphContextProvider>
	);
}
const nodeTypes = {
	giselleNode: Node,
};
const edgeTypes = {
	giselleEdge: Edge,
};
function EditorInner() {
	const { graph } = useGraph();
	const defaultNodes = useMemo<Node[]>(
		() =>
			graph.nodes.map(
				(node) =>
					({
						id: node.id,
						position: node.position,
						type: "giselleNode",
						data: {
							node,
						},
					}) as Node,
			),
		[graph.nodes],
	);

	const defaultEdges = useMemo<Edge[]>(
		() =>
			graph.connections.map(
				(connection) =>
					({
						id: connection.id,
						type: "giselleEdge",
						source: connection.sourceNodeId,
						target: connection.targetNodeId,
						targetHandle: connection.targetNodeHandleId,
						data: {
							connection,
						},
					}) satisfies Edge,
			),
		[graph.connections],
	);

	const { selectNode } = useGraphSelection();
	return (
		<div className="w-full h-screen">
			<ReactFlow<Node, Edge>
				colorMode="dark"
				defaultNodes={defaultNodes}
				defaultEdges={defaultEdges}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				onNodesChange={(nodesChange) => {
					nodesChange.map((nodeChange) => {
						if (nodeChange.type === "select") {
							selectNode(nodeChange.id as NodeId, nodeChange.selected);
						}
						if (nodeChange.type === "remove") {
							console.log(nodeChange);
						}
					});
				}}
				onEdgesChange={(edgesChange) => {
					edgesChange.map((edgeChange) => {
						if (edgeChange.type === "remove") {
							console.log(edgeChange);
						}
					});
				}}
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
				<Panel position="top-right" className="!top-0 !bottom-0 !right-0 !m-0">
					<PropertiesPanel />
				</Panel>
			</ReactFlow>
		</div>
	);
}
