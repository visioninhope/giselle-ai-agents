"use client";

import {
	Background,
	BackgroundVariant,
	ReactFlow,
	ReactFlowProvider,
} from "@xyflow/react";
import bg from "./bg.png";
import "@xyflow/react/dist/style.css";
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
const defaultNodes: Node[] = [
	{
		id: "nd_123",
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
					requirement: { id: "ndh_123", label: "Requirement" },
					sources: [
						{
							id: "ndh_source1",
							label: "Source1",
						},
					],
				},
			},
		},
	},
	{
		id: "nd_456",
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
					requirement: { id: "ndh_123", label: "Requirement" },
					sources: [
						{
							id: "ndh_source1",
							label: "Source1",
						},
						{
							id: "ndh_source2",
							label: "Source2",
						},
					],
				},
			},
		},
	},
	{
		id: "nd_789",
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
	{
		id: "nd_321",
		position: { x: 220, y: 600 },
		type: "giselleNode",
		data: {
			node: {
				id: "nd_321",
				name: "Untitled Node - 4",
				position: { x: 220, y: 600 },
				type: "variable",
				content: {
					type: "file",
				},
			},
		},
	},
];

const defaultEdges: Edge[] = [
	{
		id: "ed_123",
		source: "nd_789",
		target: "nd_123",
		targetHandle: "ndh_123",
		type: "giselleEdge",
		data: {
			connection: {
				sourceNodeId: "nd_789",
				sourceNodeType: "variable",
				targetNodeId: "nd_123",
				targetNodeHandleId: "ndh_123",
				targetNodeType: "action",
			},
		},
	},
	{
		id: "ed_456",
		source: "nd_789",
		target: "nd_456",
		targetHandle: "ndh_123",
		type: "giselleEdge",
		data: {
			connection: {
				sourceNodeId: "nd_789",
				sourceNodeType: "variable",
				targetNodeId: "nd_456",
				targetNodeHandleId: "ndh_123",
				targetNodeType: "action",
			},
		},
	},
	{
		id: "ed_789",
		source: "nd_123",
		target: "nd_456",
		targetHandle: "ndh_source1",
		type: "giselleEdge",
		data: {
			connection: {
				sourceNodeId: "nd_123",
				sourceNodeType: "action",
				targetNodeId: "nd_456",
				targetNodeHandleId: "ndh_source1",
				targetNodeType: "action",
			},
		},
	},
	{
		id: "ed_1",
		source: "nd_321",
		target: "nd_123",
		targetHandle: "ndh_source1",
		type: "giselleEdge",
		data: {
			connection: {
				sourceNodeId: "nd_321",
				sourceNodeType: "variable",
				targetNodeId: "nd_123",
				targetNodeHandleId: "ndh_source1",
				targetNodeType: "action",
			},
		},
	},
	{
		id: "ed_2",
		source: "nd_321",
		target: "nd_456",
		targetHandle: "ndh_source2",
		type: "giselleEdge",
		data: {
			connection: {
				sourceNodeId: "nd_321",
				sourceNodeType: "variable",
				targetNodeId: "nd_456",
				targetNodeHandleId: "ndh_source2",
				targetNodeType: "action",
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
