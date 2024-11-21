"use client";

import {
	Background,
	BackgroundVariant,
	ReactFlow,
	ReactFlowProvider,
} from "@xyflow/react";
import bg from "./bg.png";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { connections, nodes } from "../mockData";
import { Edge } from "./edge";
import { Node } from "./node";

export function Editor() {
	return (
		<ReactFlowProvider>
			<EditorInner />
		</ReactFlowProvider>
	);
}
const nodeTypes = {
	giselleNode: Node,
};
const edgeTypes = {
	giselleEdge: Edge,
};
function EditorInner() {
	const defaultNodes = useMemo<Node[]>(
		() =>
			nodes.map(
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
		[],
	);

	const defaultEdges = useMemo<Edge[]>(
		() =>
			connections.map(
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
		[],
	);
	return (
		<div className="w-full h-screen">
			<ReactFlow
				colorMode="dark"
				defaultNodes={defaultNodes}
				defaultEdges={defaultEdges}
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
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
			</ReactFlow>
		</div>
	);
}
