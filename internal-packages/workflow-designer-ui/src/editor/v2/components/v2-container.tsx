"use client";

import { InputId, OutputId, isActionNode } from "@giselle-sdk/data-type";
import {
	type Connection,
	type Edge,
	type IsValidConnection,
	type NodeChange,
	ReactFlow,
	Panel as XYFlowPanel,
	useReactFlow,
	useUpdateNodeInternals,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowDesigner } from "giselle-sdk/react";
import {
	type RefObject,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { Background } from "../../../ui/background";
import { useToasts } from "../../../ui/toast";
import { edgeTypes } from "../../connector";
import { type ConnectorType, GradientDef } from "../../connector/component";
import { ContextMenu } from "../../context-menu";
import type { ContextMenuProps } from "../../context-menu/types";
import { DataSourceTable } from "../../data-source";
import { type GiselleWorkflowDesignerNode, nodeTypes } from "../../node";
import { PropertiesPanel } from "../../properties-panel";
import { RunHistoryTable } from "../../run-history/run-history-table";
import { SecretTable } from "../../secret/secret-table";
import { FloatingNodePreview, Toolbar, useToolbar } from "../../tool";
import type { LeftPanelValue, V2LayoutState } from "../state";
import { FloatingPropertiesPanel } from "./floating-properties-panel";

interface V2ContainerProps extends V2LayoutState {}

function V2NodeCanvas() {
	const {
		data,
		setUiNodeState,
		setUiViewport,
		deleteNode,
		deleteConnection,
		updateNodeData,
		addNode,
		addConnection,
		isSupportedConnection,
	} = useWorkflowDesigner();
	const reactFlowInstance = useReactFlow<
		GiselleWorkflowDesignerNode,
		ConnectorType
	>();
	const updateNodeInternals = useUpdateNodeInternals();
	const { selectedTool, reset } = useToolbar();
	const toast = useToasts();
	const [menu, setMenu] = useState<Omit<ContextMenuProps, "onClose"> | null>(
		null,
	);
	const reactFlowRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		reactFlowInstance.setNodes(
			Object.entries(data.ui.nodeState)
				.map(([nodeId, nodeState]) => {
					const nodeData = data.nodes.find((node) => node.id === nodeId);
					if (nodeData === undefined || nodeState === undefined) return null;
					return {
						id: nodeId,
						type: nodeData.content.type,
						position: { x: nodeState.position.x, y: nodeState.position.y },
						selected: nodeState.selected,
						data: { nodeData },
					} as GiselleWorkflowDesignerNode;
				})
				.filter((result) => result !== null),
		);
		updateNodeInternals(Object.keys(data.ui.nodeState));
	}, [data, reactFlowInstance.setNodes, updateNodeInternals]);

	useEffect(() => {
		reactFlowInstance.setEdges(
			data.connections.map((connection) => ({
				id: connection.id,
				type: "giselleConnector",
				source: connection.outputNode.id,
				sourceHandle: connection.outputId,
				target: connection.inputNode.id,
				targetHandle: connection.inputId,
				data: { connection },
			})),
		);
	}, [data, reactFlowInstance.setEdges]);

	const handleConnect = useCallback(
		(connection: Connection) => {
			try {
				const outputNode = data.nodes.find(
					(node) => node.id === connection.source,
				);
				const inputNode = data.nodes.find(
					(node) => node.id === connection.target,
				);
				if (!outputNode || !inputNode) throw new Error("Node not found");

				const isSupported = isSupportedConnection(outputNode, inputNode);
				if (!isSupported.canConnect) throw new Error(isSupported.message);

				const safeOutputId = OutputId.safeParse(connection.sourceHandle);
				if (!safeOutputId.success) throw new Error("Invalid output id");
				const outputId = safeOutputId.data;

				if (isActionNode(inputNode)) {
					const safeInputId = InputId.safeParse(connection.targetHandle);
					if (!safeInputId.success) throw new Error("Invalid input id");
					addConnection({
						inputNode,
						inputId: safeInputId.data,
						outputNode,
						outputId,
					});
				} else {
					const newInputId = InputId.generate();
					const newInput = {
						id: newInputId,
						label: "Input",
						accessor: newInputId,
					};
					updateNodeData(inputNode, {
						inputs: [...inputNode.inputs, newInput],
					});
					addConnection({
						inputNode,
						inputId: newInput.id,
						outputId,
						outputNode,
					});
				}
			} catch (error: unknown) {
				toast.error(
					error instanceof Error ? error.message : "Failed to connect nodes",
				);
			}
		},
		[addConnection, data.nodes, toast, isSupportedConnection, updateNodeData],
	);

	const isValidConnection: IsValidConnection<ConnectorType> = (connection) => {
		if (
			!connection.sourceHandle ||
			!connection.targetHandle ||
			connection.source === connection.target
		) {
			return false;
		}
		return !data.connections.some(
			(conn) =>
				conn.inputNode.id === connection.target &&
				conn.outputNode.id === connection.source &&
				(conn.inputId === connection.targetHandle ||
					conn.outputId === connection.sourceHandle),
		);
	};

	return (
		<ReactFlow<GiselleWorkflowDesignerNode, ConnectorType>
			ref={reactFlowRef}
			className="giselle-workflow-editor-v3"
			colorMode="dark"
			defaultNodes={[]}
			defaultEdges={[]}
			nodeTypes={nodeTypes}
			edgeTypes={edgeTypes}
			defaultViewport={data.ui.viewport}
			onConnect={handleConnect}
			onEdgesDelete={useCallback(
				(edges: Edge[]) => {
					for (const edge of edges) {
						const conn = data.connections.find((c) => c.id === edge.id);
						if (conn) deleteConnection(conn.id);
					}
				},
				[data.connections, deleteConnection],
			)}
			isValidConnection={isValidConnection}
			panOnScroll={true}
			zoomOnScroll={false}
			zoomOnPinch={true}
			onMoveEnd={(_, viewport) => setUiViewport(viewport)}
			onNodesChange={useCallback(
				async (changes: NodeChange[]) => {
					await Promise.all(
						changes.map(async (change) => {
							if (change.type === "remove") await deleteNode(change.id);
						}),
					);
				},
				[deleteNode],
			)}
			onNodeClick={(_, nodeClicked) => {
				for (const node of data.nodes) {
					setUiNodeState(node.id, { selected: node.id === nodeClicked.id });
				}
			}}
			onNodeDragStop={(_, __, nodes) => {
				for (const node of nodes) {
					setUiNodeState(node.id, { position: node.position }, { save: true });
				}
			}}
			onPaneClick={(event) => {
				setMenu(null);
				for (const node of data.nodes) {
					setUiNodeState(node.id, { selected: false });
				}
				const position = reactFlowInstance.screenToFlowPosition({
					x: event.clientX,
					y: event.clientY,
				});
				if (selectedTool?.action === "addNode") {
					addNode(selectedTool.node, { ui: { position } });
				}
				reset();
			}}
			onNodeContextMenu={(event, node) => {
				event.preventDefault();
				const pane = reactFlowRef.current?.getBoundingClientRect();
				if (!pane) return;
				setMenu({
					id: node.id,
					top: event.clientY < pane.height - 200 ? event.clientY : undefined,
					left: event.clientX < pane.width - 200 ? event.clientX : undefined,
					right:
						event.clientX >= pane.width - 200
							? pane.width - event.clientX
							: undefined,
					bottom:
						event.clientY >= pane.height - 200
							? pane.height - event.clientY
							: undefined,
				});
			}}
		>
			<Background />
			{selectedTool?.action === "addNode" && (
				<FloatingNodePreview node={selectedTool.node} />
			)}
			<XYFlowPanel position="bottom-center">
				<Toolbar />
			</XYFlowPanel>
			{menu && <ContextMenu {...menu} onClose={() => setMenu(null)} />}
		</ReactFlow>
	);
}

export function V2Container({ leftPanel }: V2ContainerProps) {
	const { data } = useWorkflowDesigner();
	const selectedNodes = useMemo(
		() =>
			Object.entries(data.ui.nodeState)
				.filter(([_, nodeState]) => nodeState?.selected)
				.map(([nodeId]) => data.nodes.find((node) => node.id === nodeId))
				.filter((node) => node !== undefined),
		[data],
	);

	const isPropertiesPanelOpen = selectedNodes.length === 1;

	const mainRef = useRef<HTMLDivElement>(null);

	return (
		<main
			className="relative flex-1 bg-black-900 overflow-hidden"
			ref={mainRef}
		>
			<div className="h-full">
				<LeftPanel value={leftPanel} containerRef={mainRef} />
				<V2NodeCanvas />

				{/* Floating Properties Panel */}
				<FloatingPropertiesPanel
					isOpen={isPropertiesPanelOpen}
					container={mainRef.current}
					title="Properties Panel"
				>
					<PropertiesPanel />
				</FloatingPropertiesPanel>
			</div>
			<GradientDef />
		</main>
	);
}

function LeftPanel({
	value,
	containerRef,
}: {
	value: LeftPanelValue | null;
	containerRef: RefObject<HTMLDivElement | null>;
}) {
	const content = useMemo(() => {
		if (value === null) {
			return null;
		}
		switch (value) {
			case "data-source":
				return <DataSourceTable />;
			case "run-history":
				return <RunHistoryTable />;
			case "secret":
				return <SecretTable />;
			default: {
				const _exhaustiveCheck: never = value;
				throw new Error(`Unhandled leftPanel: ${_exhaustiveCheck}`);
			}
		}
	}, [value]);
	if (content === null) {
		return null;
	}
	return (
		<FloatingPropertiesPanel
			isOpen
			position="left"
			container={containerRef?.current}
			title="Left Panel"
		>
			{content}
		</FloatingPropertiesPanel>
	);
}
