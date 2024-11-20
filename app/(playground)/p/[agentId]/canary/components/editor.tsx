"use client";

import {
	Background,
	BackgroundVariant,
	ReactFlow,
	ReactFlowProvider,
} from "@xyflow/react";
import bg from "./bg.png";
import "@xyflow/react/dist/style.css";
import { TextGenerationNode } from "../text-generation/node";

export function Editor() {
	return (
		<ReactFlowProvider>
			<EditorInner />
		</ReactFlowProvider>
	);
}
const nodeTypes = {
	textGeneration: TextGenerationNode,
};
const defaultNodes = [
	{
		id: "1",
		position: { x: 0, y: 0 },
		type: "textGeneration",
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
