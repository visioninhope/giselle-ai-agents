import {
	type Node as BlueprintNode,
	addNode,
	connectNodes,
	deleteEdges,
	deleteNodes,
	updateNodesPosition,
	useBlueprint,
} from "@/app/agents/blueprints";
import { Finder } from "@/app/nodes";
import {
	Background,
	type Edge,
	type Node,
	Panel,
	ReactFlow,
	ReactFlowProvider,
	useReactFlow,
} from "@xyflow/react";
import { type FC, useCallback, useRef } from "react";
import { Header } from "./header";
import {
	convertXyFlowConnection,
	useContextMenu,
	useInfereceConnectionEdgeType,
	useNodeTypes,
	useSynthsize,
} from "./hooks/";
import { PropertyPanel } from "./property-panel";

const CanvasInner: FC = () => {
	useSynthsize();
	const { isVisible, contextMenuPosition, hideContextMenu, handleContextMenu } =
		useContextMenu();
	const containerRef = useRef<HTMLDivElement>(null);
	const nodeTypes = useNodeTypes();
	const { blueprint, mutate, createTemporaryId } = useBlueprint();
	const reactFlowInstance = useReactFlow();
	const { validateConnection, inferConnectionEdgeType } =
		useInfereceConnectionEdgeType();

	const handleSelectNode = useCallback(
		(node: BlueprintNode) => {
			hideContextMenu();
			mutate({
				type: "addNode",
				optimisticData: { node },
				action: () => addNode({ blueprintId: blueprint.id, node }),
			});
		},
		[mutate, blueprint.id, hideContextMenu],
	);
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
								onSelect={handleSelectNode}
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
