"use client";

import {
	Background,
	BackgroundVariant,
	Panel,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
	useUpdateNodeInternals,
} from "@xyflow/react";
import bg from "./bg.png";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo } from "react";
import { GraphContextProvider, useGraph } from "../contexts/graph";
import {
	PropertiesPanelProvider,
	usePropertiesPanel,
} from "../contexts/properties-panel";
import type { Graph, NodeId } from "../types";
import { Edge } from "./edge";
import { Node } from "./node";
import { PropertiesPanel } from "./properties-panel";
import { Toolbar } from "./toolbar";

interface EditorProps {
	graph: Graph;
}
export function Editor(props: EditorProps) {
	return (
		<GraphContextProvider defaultGraph={props.graph}>
			<PropertiesPanelProvider>
				<ReactFlowProvider>
					<EditorInner />
				</ReactFlowProvider>
			</PropertiesPanelProvider>
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
	const { graph, dispatch } = useGraph();
	const reactFlowInstance = useReactFlow<Node, Edge>();
	const updateNodeInternals = useUpdateNodeInternals();
	useEffect(() => {
		const currentNodes = reactFlowInstance.getNodes();
		reactFlowInstance.setNodes(
			graph.nodes.map((node) => {
				const currentNode = currentNodes.find(
					(currentNode) => currentNode.id === node.id,
				);
				return {
					...currentNode,
					id: node.id,
					type: "giselleNode",
					position: node.position,
					selected: node.selected,
					data: {
						node,
					},
				} as Node;
			}),
		);
		updateNodeInternals(graph.nodes.map((node) => node.id));
	}, [
		graph.nodes,
		reactFlowInstance.getNodes,
		reactFlowInstance.setNodes,
		updateNodeInternals,
	]);

	useEffect(() => {
		reactFlowInstance.setEdges(
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
		);
	}, [graph.connections, reactFlowInstance.setEdges]);
	const { setTab } = usePropertiesPanel();
	return (
		<div className="w-full h-screen">
			<ReactFlow<Node, Edge>
				colorMode="dark"
				defaultNodes={[]}
				defaultEdges={[]}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				onNodesChange={(nodesChange) => {
					nodesChange.map((nodeChange) => {
						switch (nodeChange.type) {
							case "select": {
								const node = graph.nodes.find(
									(node) => node.id === nodeChange.id,
								);
								if (node === undefined) {
									return;
								}
								// selectNode(node.id, nodeChange.selected);
								dispatch({
									type: "updateNodeSelection",
									input: {
										nodeId: node.id,
										selected: nodeChange.selected,
									},
								});
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
								break;
							}
							case "remove": {
								console.log(nodeChange);
								break;
							}
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
				onNodeDragStop={(_event, _node, nodes) => {
					nodes.map((node) => {
						dispatch({
							type: "updateNodePosition",
							input: {
								nodeId: node.id as NodeId,
								position: node.position,
							},
						});
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
				<Panel position={"bottom-center"}>
					<Toolbar />
				</Panel>
			</ReactFlow>
		</div>
	);
}
