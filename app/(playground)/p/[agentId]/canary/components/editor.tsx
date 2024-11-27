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
import {
	PropertiesPanelProvider,
	usePropertiesPanel,
} from "../contexts/properties-panel";
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
	const nodes = useMemo<Node[]>(
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

	const edges = useMemo<Edge[]>(
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
	const { setTab } = usePropertiesPanel();
	return (
		<div className="w-full h-screen">
			<ReactFlow<Node, Edge>
				colorMode="dark"
				defaultNodes={nodes}
				defaultEdges={edges}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				onNodesChange={(nodesChange) => {
					nodesChange.map((nodeChange) => {
						if (nodeChange.type === "select") {
							const xyFlowNode = nodes.find(
								(node) => node.id === nodeChange.id,
							);
							if (xyFlowNode === undefined) {
								return;
							}
							const node = xyFlowNode.data.node;
							selectNode(node.id, nodeChange.selected);
							if (nodeChange.selected) {
								switch (node.content.type) {
									case "textGeneration":
										setTab("Prompt");
										break;
									case "text":
										setTab("Text");
										break;
									case "file":
										setTab("File");
										break;
									default:
										break;
								}
							}
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
