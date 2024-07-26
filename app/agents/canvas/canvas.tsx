"use client";

import type { AvailableAgentWithInputPort } from "@/app/agents";
import {
	connectNodes,
	deleteEdges,
	deleteNodes,
	updateNodesPosition,
	useBlueprint,
	useBlueprintMutation,
} from "@/app/agents/blueprints";
import type { ExcludeAgentNodeClassName } from "@/app/node-classes";
import { createId } from "@paralleldrive/cuid2";
import {
	Background,
	type Edge,
	type Node,
	type NodeTypes,
	Panel,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import { type FC, useCallback, useRef } from "react";
import { Header } from "./header";
import {
	useAddNodeAction,
	useContextMenu,
	useInfereceConnectionEdgeType,
	useNodeSelection,
	useSynthsize,
} from "./hooks/";
import { NodeList, useNodeTypes } from "./node";
import { PropertyPanel } from "./property-panel";

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
		async (nodeClassName: ExcludeAgentNodeClassName) => {
			hideContextMenu();
			addNodeAction({
				nodeClassName,
				position,
			});
		},
		[position, hideContextMenu, addNodeAction],
	);
	const handleAgentSelect = useCallback(
		(agent: AvailableAgentWithInputPort) => {
			hideContextMenu();
			addNodeAction({
				nodeClassName: "agent",
				position,
				relevantAgent: {
					/** @todo remove ?? */
					agentName: agent.name ?? "",
					agentId: agent.id,
					blueprintId: agent.blueprintId,
					inputPorts: agent.inputPorts,
				},
			});
		},
		[hideContextMenu, position, addNodeAction],
	);
	const { validateConnection, inferConnectionEdgeType } =
		useInfereceConnectionEdgeType();
	const { handleNodesChange, selectedNodes } = useNodeSelection();
	return (
		<div className="flex flex-col h-full">
			<Header />
			<div className="flex-1" ref={containerRef}>
				<ReactFlow
					colorMode="dark"
					onContextMenu={handleContextMenu}
					nodeTypes={nodeTypes}
					defaultNodes={[] as Node[]}
					defaultEdges={[] as Edge[]}
					isValidConnection={validateConnection}
					onNodesChange={handleNodesChange}
					onConnect={({ source, sourceHandle, target, targetHandle }) => {
						if (
							source == null ||
							sourceHandle == null ||
							target == null ||
							targetHandle == null
						) {
							return;
						}
						const edgeType = inferConnectionEdgeType({
							source,
							sourceHandle,
							target,
							targetHandle,
						});

						mutateBlueprint({
							optimisticAction: {
								type: "connectNodes",
								edge: {
									id: createId(),
									edgeType,
									inputPort: {
										id: targetHandle,
										nodeId: target,
									},
									outputPort: {
										id: sourceHandle,
										nodeId: source,
									},
								},
							},
							mutation: connectNodes({
								blueprintId: blueprint.id,
								edge: {
									id: createId(),
									edgeType,
									inputPort: {
										id: targetHandle,
										nodeId: target,
									},
									outputPort: {
										id: sourceHandle,
										nodeId: source,
									},
								},
							}),
							action: ({ id }) => ({
								type: "connectNodes",
								edge: {
									id,
									edgeType,
									inputPort: {
										id: targetHandle,
										nodeId: target,
									},
									outputPort: {
										id: sourceHandle,
										nodeId: source,
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
									nodeId: node.id,
								})),
							},
							mutation: deleteNodes({
								blueprintId: blueprint.id,
								deleteNodeIds: nodes.map((node) =>
									Number.parseInt(node.id, 10),
								),
							}),
							action: () => ({
								type: "deleteNodes",
								deltedNodes: nodes.map((node) => ({
									nodeId: node.id,
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
								deleteEdgeIds: edges.map((edge) =>
									Number.parseInt(edge.id, 10),
								),
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
					<Background className="!bg-zinc-900/70" />
					<Panel position="top-right" className="bottom-0">
						<div className="flex gap-2 h-full">
							<PropertyPanel selectedNodes={selectedNodes} />
						</div>
					</Panel>
					{isVisible && (
						<div
							className="z-10 absolute"
							style={{
								left: position.x - (containerRef?.current?.offsetLeft ?? 0),
								top: position.y - (containerRef?.current?.offsetTop ?? 0),
							}}
						>
							<NodeList
								onSelect={handleNodeSelect}
								onAgentSelect={handleAgentSelect}
							/>
						</div>
					)}
				</ReactFlow>
			</div>
		</div>
	);
};

export const Canvas: FC = () => (
	<ReactFlowProvider>
		<CanvasInner />
	</ReactFlowProvider>
);
