"use client";

import type { AvailableAgentWithInputPort } from "@/app/agents";
import {
	connectNodes,
	deleteEdges,
	deleteNodes,
	updateNodesPosition,
	useBlueprint,
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
	const { blueprint, mutate } = useBlueprint();
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

						mutate({
							type: "connectNodes",
							optimisticData: {
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
							action: async (optimisticData) =>
								await connectNodes({
									blueprintId: blueprint.id,
									...optimisticData,
								}),
						});
					}}
					onNodesDelete={(nodes) => {
						mutate({
							type: "deleteNodes",
							optimisticData: {
								deleteNodeIds: nodes.map((node) => node.id),
							},
							action: () =>
								deleteNodes({
									blueprintId: blueprint.id,
									deleteNodeIds: nodes.map((node) =>
										Number.parseInt(node.id, 10),
									),
								}).then(({ deleteNodeIds }) => ({
									deleteNodeIds: deleteNodeIds.map((id) => `${id}`),
								})),
						});
					}}
					onNodeDragStop={(_event, _node, nodes) => {
						mutate({
							type: "updateNodesPosition",
							optimisticData: {
								nodes: nodes.map((node) => ({
									nodeId: node.id,
									position: {
										x: node.position.x,
										y: node.position.y,
									},
								})),
							},
							action: (optimisticData) =>
								updateNodesPosition({
									nodes: optimisticData.nodes.map((node) => ({
										...node,
										id: Number.parseInt(node.nodeId, 10),
									})),
								}).then(({ nodes }) => ({
									nodes: nodes.map((node) => ({
										...node,
										nodeId: `${node.id}`,
									})),
								})),
						});
					}}
					onEdgesDelete={(edges) => {
						mutate({
							type: "deleteEdges",
							optimisticData: {
								deleteEdgeIds: edges.map((edge) =>
									Number.parseInt(edge.id, 10),
								),
							},
							action: (optimisticData) =>
								deleteEdges({
									blueprintId: blueprint.id,
									...optimisticData,
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
