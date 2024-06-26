"use client";

import { type FC, useCallback, useRef, useState } from "react";
import ReactFlow, {
	MiniMap,
	Controls,
	Background,
	useNodesState,
	useEdgesState,
	addEdge,
	type OnConnect,
	type Node,
	BackgroundVariant,
	type Edge,
	type ReactFlowInstance,
	ReactFlowProvider,
} from "reactflow";

import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { createId } from "@paralleldrive/cuid2";
import { ALargeSmallIcon, GripIcon, PlusIcon } from "lucide-react";
import invariant from "tiny-invariant";
import { NodeTypes, useNodeTypes } from "./node";
import {
	NodeSelectCommand,
	type OnNodeSelect,
	nodeStructures,
} from "./node-list";
import type { NodeData } from "./nodev2";
import type { Context } from "./strcture";
import { useContextMenu } from "./use-context-menu";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];
const contexts: Context[] = [
	{
		key: "inputResources",
		name: "Input Resources",
		type: "string",
		array: true,
	},
	{
		key: "documents",
		name: "Documents",
		type: "string",
		array: true,
	},
	{
		key: "theme",
		name: "Theme",
		type: "string",
	},
	{
		key: "format",
		name: "Format",
		type: "string",
	},
];

const WorkflowEditor: FC = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const nodeTypes = useNodeTypes();
	const [nodes, setNodes, onNodesChange] =
		useNodesState<NodeData>(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const { isVisible, position, hideContextMenu, handleContextMenu } =
		useContextMenu();

	const [reactFlowInstance, setReactFlowInstance] =
		useState<ReactFlowInstance | null>(null);
	const onConnect = useCallback<OnConnect>(
		(params) => setEdges((eds) => addEdge(params, eds)),
		[setEdges],
	);
	const handleNodeSelect = useCallback<OnNodeSelect>(
		(key) => {
			const nodeStructure = nodeStructures.find((node) => node.key === key);
			invariant(nodeStructure != null, "Node structure not found");
			hideContextMenu();

			if (reactFlowInstance == null) {
				return;
			}

			// reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
			// and you don't need to subtract the reactFlowBounds.left/top anymore
			// details: https://reactflow.dev/whats-new/2023-11-10
			const flowPosition = reactFlowInstance.screenToFlowPosition({
				x: position.x,
				y: position.y,
			});
			setNodes((prevNodes) => [
				...prevNodes,
				{
					id: createId(),
					type: NodeTypes.V2,
					position: { x: flowPosition.x, y: flowPosition.y },
					data: {
						structureKey: key,
					},
				},
			]);
		},
		[hideContextMenu, position, reactFlowInstance, setNodes],
	);

	return (
		<div className="w-screen h-screen pl-4 pb-4 pt-2 pr-2 bg-secondary flex flex-col text-foreground">
			<div className="mb-2 text-primary">Agent Flow Editor</div>
			<div className="w-full h-full flex border border-border bg-background">
				<div className="w-[200px] border-r p-0.5">
					<div className="flex items-center justify-between bg-secondary text-secondary-foreground px-1 py-1">
						<p>Context</p>
						<Button size="icon">
							<PlusIcon className="w-4 h-4" />
						</Button>
					</div>
					<ul className="flex flex-col gap-1 mt-1">
						{contexts.map(({ key, name, array }) => (
							<li
								key={key}
								className="flex items-center gap-1 hover:bg-primary/10 cursor-pointer px-2 py-1"
							>
								{array ? (
									<GripIcon className="w-4 h-4" />
								) : (
									<ALargeSmallIcon className="w-4 h-4" />
								)}

								<span>{name}</span>
							</li>
						))}
					</ul>
				</div>
				<div className="flex-1" ref={containerRef}>
					<ReactFlow
						onContextMenu={handleContextMenu}
						onPaneClick={hideContextMenu}
						nodes={nodes}
						edges={edges}
						onNodesChange={onNodesChange}
						onEdgesChange={onEdgesChange}
						nodeTypes={nodeTypes}
						onConnect={onConnect}
						onInit={setReactFlowInstance}
					>
						<Background
							variant={BackgroundVariant.Dots}
							className="bg-gradient-to-b from-zinc-800 to-zinc-900"
						/>
						<Controls />
						<MiniMap />
						{isVisible && (
							<div
								className="z-10 absolute"
								style={{
									left: position.x - (containerRef?.current?.offsetLeft ?? 0),
									top: position.y - (containerRef?.current?.offsetTop ?? 0),
								}}
							>
								<NodeSelectCommand onSelect={handleNodeSelect} />
							</div>
						)}
					</ReactFlow>
				</div>
			</div>
		</div>
	);
};

export default function Page({ params }: { params: { slug: string } }) {
	return (
		<ReactFlowProvider>
			<WorkflowEditor />
		</ReactFlowProvider>
	);
}
