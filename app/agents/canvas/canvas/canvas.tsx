"use client";

import {
	connectNodes,
	deleteEdges,
	deleteNodes,
	updateNodesPosition,
	useBlueprint,
	useBlueprintMutation,
} from "@/app/agents/blueprints";
import type { NodeClassName } from "@/app/node-classes";
import { createId } from "@paralleldrive/cuid2";
import {
	Background,
	type Edge,
	type Node,
	type NodeTypes,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import { type FC, useCallback, useRef } from "react";
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
				defaultEdges={[] as Edge[]}
				onConnect={({ source, sourceHandle, target, targetHandle }) => {
					if (
						source == null ||
						sourceHandle == null ||
						target == null ||
						targetHandle == null
					) {
						return;
					}
					mutateBlueprint({
						optimisticAction: {
							type: "connectNodes",
							edge: {
								id: createId(),
								edgeType: "data",
								inputPort: {
									id: Number.parseInt(targetHandle, 10),
									nodeId: Number.parseInt(target, 10),
								},
								outputPort: {
									id: Number.parseInt(sourceHandle, 10),
									nodeId: Number.parseInt(source, 10),
								},
							},
						},
						mutation: connectNodes({
							blueprintId: blueprint.id,
							edge: {
								id: createId(),
								edgeType: "data",
								inputPort: {
									id: Number.parseInt(targetHandle, 10),
									nodeId: Number.parseInt(target, 10),
								},
								outputPort: {
									id: Number.parseInt(sourceHandle, 10),
									nodeId: Number.parseInt(source, 10),
								},
							},
						}),
						action: ({ id }) => ({
							type: "connectNodes",
							edge: {
								id,
								edgeType: "data",
								inputPort: {
									id: Number.parseInt(targetHandle, 10),
									nodeId: Number.parseInt(target, 10),
								},
								outputPort: {
									id: Number.parseInt(sourceHandle, 10),
									nodeId: Number.parseInt(source, 10),
								},
							},
						}),
					});
				}}
				onNodesDelete={(nodes) => {
					mutateBlueprint({
						optimisticAction: {
							type: "deleteNodes",
							deltedNodes: nodes.map((node) => ({
								nodeId: Number.parseInt(node.id, 10),
							})),
						},
						mutation: deleteNodes({
							blueprintId: blueprint.id,
							deleteNodeIds: nodes.map((node) => Number.parseInt(node.id, 10)),
						}),
						action: () => ({
							type: "deleteNodes",
							deltedNodes: nodes.map((node) => ({
								nodeId: Number.parseInt(node.id, 10),
							})),
						}),
					});
				}}
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
				onEdgesDelete={(edges) => {
					mutateBlueprint({
						optimisticAction: {
							type: "deleteEdges",
							deletedEdges: edges.map((edge) => ({
								edgeId: Number.parseInt(edge.id, 10),
							})),
						},
						mutation: deleteEdges({
							blueprintId: blueprint.id,
							deleteEdgeIds: edges.map((edge) => Number.parseInt(edge.id, 10)),
						}),
						action: (deletedEdgeIds) => ({
							type: "deleteEdges",
							deletedEdges: deletedEdgeIds.map((edgeId) => ({
								edgeId,
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
