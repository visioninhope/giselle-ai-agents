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
const defaultNodes: Node[] = [
	{
		id: "1",
		position: { x: 120, y: 200 },
		type: "giselleNode",
		data: {
			node: {
				id: "nd_123",
				name: "Untitled Node - 1",
				position: { x: 120, y: 200 },
				type: "action",
				content: {
					type: "textGeneration",
					llm: "gpt2",
					temperature: 0.7,
					topP: 1,
					instruction: "Write a short story about a cat",
					requirement: { id: "ndr_123", label: "Requirement" },
					sources: [],
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
				id: "nd_456",
				name: "Untitled Node - 2",
				position: { x: 320, y: 200 },
				type: "action",
				content: {
					type: "textGeneration",
					llm: "gpt2",
					temperature: 0.7,
					topP: 1,
					instruction: "Write a short story about a cat",
					requirement: { id: "ndr_123", label: "Requirement" },
					sources: [
						{
							id: "ndr_456",
							label: "Source1",
						},
					],
				},
			},
		},
	},
	{
		id: "3",
		position: { x: 220, y: 400 },
		type: "giselleNode",
		data: {
			node: {
				id: "nd_789",
				name: "Untitled Node - 3",
				position: { x: 220, y: 200 },
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
