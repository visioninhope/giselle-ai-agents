"use client";

import {
	Background,
	BackgroundVariant,
	ReactFlow,
	ReactFlowProvider,
} from "@xyflow/react";
import bg from "./bg.png";
import "@xyflow/react/dist/style.css";
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
const defaultNodes = [
	{
		id: "1",
		position: { x: 120, y: 200 },
		type: "giselleNode",
		data: {
			node: {
				name: "Untitled Node - 1",
				type: "action",
				content: {
					type: "textGeneration",
				},
			},
		},
	},
	{
		id: "2",
		position: { x: 320, y: 200 },
		type: "giselleNode",
		data: {
			node: {
				name: "Untitled Node - 2",
				type: "action",
				content: {
					type: "textGeneration",
				},
			},
		},
	},
	{
		id: "3",
		position: { x: 220, y: 200 },
		type: "giselleNode",
		data: {
			node: {
				name: "Untitled Node - 3",
				type: "variable",
				content: {
					type: "text",
				},
			},
		},
	},
];
function EditorInner() {
	return (
		<div className="w-full h-screen">
			<ReactFlow
				colorMode="dark"
				defaultNodes={defaultNodes}
				nodeTypes={nodeTypes}
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
