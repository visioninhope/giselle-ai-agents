"use client";

import {
	updateNodesPosition,
	useBlueprint,
	useBlueprintMutation,
} from "@/app/agents/blueprints";
import type { NodeClassName } from "@/app/node-classes";
import {
	Background,
	type Node,
	type NodeTypes,
	ReactFlow,
	type ReactFlowInstance,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { useContextMenu, useSynthsize } from "../hooks/";
import { NodeList, useNodeTypes } from "../node";
import { useAddNodeAction } from "./use-add-node-action";

const CanvasInner: FC = () => {
	useSynthsize();
	const { isVisible, position, hideContextMenu, handleContextMenu } =
		useContextMenu();
	const { addNodeAction } = useAddNodeAction();
	const containerRef = useRef<HTMLDivElement>(null);
	const nodeTypes: NodeTypes = useNodeTypes();
	const blueprint = useBlueprint();
	const { mutateBlueprint } = useBlueprintMutation();
	const reactFlowInstance = useReactFlow();
	const handleNodeSelect = useCallback(
		async (nodeClassName: NodeClassName) => {
			hideContextMenu();
			addNodeAction({
				nodeClassName,
				position,
			});
		},
		[position, hideContextMenu, addNodeAction],
	);
	return (
		<div className="flex-1" ref={containerRef}>
			<ReactFlow
				onContextMenu={handleContextMenu}
				nodeTypes={nodeTypes}
				defaultNodes={[] as Node[]}
				defaultEdges={[]}
				onNodeDragStop={(_event, _node, nodes) => {
					mutateBlueprint({
						optimisticAction: {
							type: "updateNodesPosition",
							nodes: nodes.map((node) => ({
								nodeId: node.id,
								position: {
									x: node.position.x,
									y: node.position.y,
								},
							})),
						},
						mutation: updateNodesPosition({
							nodes: nodes.map((node) => ({
								id: Number.parseInt(node.id, 10),
								position: {
									x: node.position.x,
									y: node.position.y,
								},
							})),
						}),
						action: () => ({
							type: "updateNodesPosition",
							nodes: nodes.map((node) => ({
								nodeId: node.id,
								position: {
									x: node.position.x,
									y: node.position.y,
								},
							})),
						}),
					});
				}}
			>
				<Background />
				{isVisible && (
					<div
						className="z-10 absolute"
						style={{
							left: position.x - (containerRef?.current?.offsetLeft ?? 0),
							top: position.y - (containerRef?.current?.offsetTop ?? 0),
						}}
					>
						<NodeList onSelect={handleNodeSelect} />
					</div>
				)}
			</ReactFlow>
		</div>
	);
};

export const Canvas: FC = () => (
	<ReactFlowProvider>
		<CanvasInner />
	</ReactFlowProvider>
);
