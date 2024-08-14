import type { AvailableAgentWithInputPort } from "@/app/agents";
import {
	addNode,
	connectNodes,
	deleteEdges,
	deleteNodes,
	updateNodesPosition,
	useBlueprint,
} from "@/app/agents/blueprints";
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
import invariant from "tiny-invariant";
import { Finder } from "./components/finder";
import { Header } from "./header";
import {
	convertXyFlowConnection,
	useAddNodeAction,
	useContextMenu,
	useInfereceConnectionEdgeType,
	useSynthsize,
} from "./hooks/";
import { useNodeTypes } from "./node";
import { PropertyPanel } from "./property-panel";

const CanvasInner: FC = () => {
	useSynthsize();
	const { isVisible, contextMenuPosition, hideContextMenu, handleContextMenu } =
		useContextMenu();
	const { addNodeAction } = useAddNodeAction();
	const containerRef = useRef<HTMLDivElement>(null);
	const nodeTypes: NodeTypes = useNodeTypes();
	const { blueprint, mutate, createTemporaryId } = useBlueprint();
	const reactFlowInstance = useReactFlow();
	// const handleNodeSelect = useCallback(
	// 	async (nodeClass: NodeClass) => {
	// 		hideContextMenu();
	// 		addNodeAction({
	// 			nodeClass,
	// 			position: contextMenuPosition,
	// 		});
	// 	},
	// 	[contextMenuPosition, hideContextMenu, addNodeAction],
	// );
	// const handleAgentSelect = useCallback(
	// 	(agent: AvailableAgentWithInputPort) => {
	// 		hideContextMenu();
	// 		addNodeAction({
	// 			nodeClassName: "agent",
	// 			position: contextMenuPosition,
	// 			relevantAgent: {
	// 				/** @todo remove ?? */
	// 				agentName: agent.name ?? "",
	// 				agentId: agent.id,
	// 				blueprintId: agent.blueprintId,
	// 				inputPorts: agent.inputPorts,
	// 			},
	// 		});
	// 	},
	// 	[hideContextMenu, contextMenuPosition, addNodeAction],
	// );
	const { validateConnection, inferConnectionEdgeType } =
		useInfereceConnectionEdgeType();
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
					isValidConnection={({
						source,
						sourceHandle,
						target,
						targetHandle,
					}) => {
						if (
							source == null ||
							sourceHandle == null ||
							target == null ||
							targetHandle == null
						) {
							return false;
						}
						const connection = convertXyFlowConnection({
							source,
							sourceHandle,
							target,
							targetHandle,
						});
						return validateConnection(connection);
					}}
					onConnect={({ source, sourceHandle, target, targetHandle }) => {
						if (
							source == null ||
							sourceHandle == null ||
							target == null ||
							targetHandle == null
						) {
							return;
						}
						const connection = convertXyFlowConnection({
							source,
							sourceHandle,
							target,
							targetHandle,
						});
						const edgeType = inferConnectionEdgeType(connection);

						mutate({
							type: "connectNodes",
							optimisticData: {
								edge: {
									id: createTemporaryId(),
									edgeType,
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
								deleteNodeIds: nodes.map((node) => Number.parseInt(node.id)),
							},
							action: () =>
								deleteNodes({
									blueprintId: blueprint.id,
									deleteNodeIds: nodes.map((node) =>
										Number.parseInt(node.id, 10),
									),
								}),
						});
					}}
					onNodeDragStop={(_event, _node, nodes) => {
						mutate({
							type: "updateNodesPosition",
							optimisticData: {
								nodes: nodes.map((node) => ({
									id: Number.parseInt(node.id),
									position: {
										x: node.position.x,
										y: node.position.y,
									},
								})),
							},
							action: (optimisticData) =>
								updateNodesPosition({
									...optimisticData,
									blueprintId: blueprint.id,
								}),
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
							<PropertyPanel />
						</div>
					</Panel>
					{reactFlowInstance && isVisible && (
						<div
							className="z-10 absolute"
							style={{
								left:
									contextMenuPosition.x -
									(containerRef?.current?.offsetLeft ?? 0),
								top:
									contextMenuPosition.y -
									(containerRef?.current?.offsetTop ?? 0),
							}}
						>
							<Finder
								position={reactFlowInstance.screenToFlowPosition({
									x: contextMenuPosition.x,
									y: contextMenuPosition.y,
								})}

								// onSelect={(nodeClass) => {
								// 	invariant(
								// 		reactFlowInstance != null,
								// 		"reactFlowInstance is null",
								// 	);
								// 	const position = reactFlowInstance.screenToFlowPosition({
								// 		x: contextMenuPosition.x,
								// 		y: contextMenuPosition.y,
								// 	});
								// 	const nodeId = createTemporaryId();
								// 	mutate({
								// 		type: "addNode",
								// 		optimisticData: {
								// 			node: {
								// 				id: nodeId,
								// 				isCreating: true,
								// 				position,
								// 				className: nodeClass.name,
								// 				properties: nodeClass.template.properties ?? [],
								// 				inputPorts: (nodeClass.template.inputPorts ?? []).map(
								// 					({ type, label, key }, index) => ({
								// 						id: createTemporaryId(),
								// 						nodeId,
								// 						type,
								// 						name: label ?? "",
								// 						direction: "input",
								// 						order: index,
								// 						portsBlueprintsId: 0,
								// 						nodeClassKey: key,
								// 					}),
								// 				),
								// 				outputPorts: (nodeClass.template.outputPorts ?? []).map(
								// 					({ type, label, key }, index) => ({
								// 						id: createTemporaryId(),
								// 						nodeId,
								// 						type,
								// 						name: label ?? "",
								// 						direction: "output",
								// 						order: index,
								// 						portsBlueprintsId: 0,
								// 						nodeClassKey: key,
								// 					}),
								// 				),
								// 			},
								// 		},
								// 		action: ({ node }) =>
								// 			addNode({
								// 				blueprintId: blueprint.id,
								// 				node,
								// 			}),
								// 	});
								// }}
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
