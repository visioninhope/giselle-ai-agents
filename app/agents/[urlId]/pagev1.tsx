"use client";

import {
	Background,
	BackgroundVariant,
	Controls,
	Panel,
	ReactFlow,
	type ReactFlowInstance,
	ReactFlowProvider,
} from "@xyflow/react";
import { type FC, useCallback, useRef, useState } from "react";

import "@xyflow/react/dist/style.css";
import {
	BlueprintIdProvider,
	useBuildBlueprintAction,
	useRequiredActions,
} from "@/app/agents/blueprints";
import {
	EditorDropdownMenu,
	useContextMenu,
	useEditor,
} from "@/app/agents/blueprints/editor";
import {
	PropertyPanel,
	RequestButton,
	RequestLogger,
	useNodeSelection,
} from "@/app/agents/canvas";
import { useRequest } from "@/app/agents/requests";
import { type NodeClassName, NodeClassesProvider } from "@/app/node-classes";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayIcon } from "@radix-ui/react-icons";
import {
	ALargeSmallIcon,
	CircleAlertIcon,
	GripIcon,
	PlusIcon,
} from "lucide-react";
import { useLatestBlueprintGlance } from "./blueprints";
import { useNodeTypes } from "./node";
import { ServerComponent } from "./server";
import type { Context } from "./strcture";

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
	const { build } = useBuildBlueprintAction();
	const { createRequest, request } = useRequest();
	const { addNode, updateNodesPosition, deleteNodes, addEdge, deleteEdges } =
		useEditor(request);
	const containerRef = useRef<HTMLDivElement>(null);
	const nodeTypes = useNodeTypes();
	const { isVisible, position, hideContextMenu, handleContextMenu } =
		useContextMenu();

	const [reactFlowInstance, setReactFlowInstance] =
		useState<ReactFlowInstance | null>(null);
	const handleNodeSelect = useCallback(
		(nodeClassName: NodeClassName) => {
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
			addNode({
				node: {
					className: nodeClassName,
					position: { x: flowPosition.x, y: flowPosition.y },
				},
			});
		},
		[hideContextMenu, position, reactFlowInstance, addNode],
	);
	const { selectedNodes, handleNodesChange } = useNodeSelection();
	const requiredActions = useRequiredActions();
	const handleSubmitRequest = useCallback(() => {
		build().then(({ blueprintId }) => createRequest({ blueprintId }));
	}, [build, createRequest]);
	return (
		<div className="w-screen h-screen pl-4 pb-4 pt-2 pr-2 bg-background flex flex-col text-foreground">
			<div className="mb-2 text-primary">Agent Flow Editor</div>
			<div className="w-full h-full flex bg-background gap-4">
				<div className="w-[200px] p-0.5">
					<div>
						<div className="flex items-center justify-between text-secondary-foreground px-1 py-1 text-sm">
							<p>Files</p>
						</div>

						<ul className="flex flex-col gap-1 mt-1">
							<li className="flex items-center gap-1 hover:bg-primary/10 cursor-pointer px-2 py-1 text-sm text-muted-foreground">
								<span>Workflow.wrk</span>
							</li>
							<li className="flex items-center gap-1 hover:bg-primary/10 cursor-pointer px-2 py-1 text-sm text-muted-foreground">
								<span>Draft.agt</span>
							</li>
						</ul>
					</div>
					<div>
						<div className="flex items-center justify-between text-secondary-foreground px-1 py-1 text-sm">
							<p>Context</p>
							<Button size="icon">
								<PlusIcon className="w-6 h-6" />
							</Button>
						</div>
						<ul className="flex flex-col gap-1 mt-1">
							{contexts.map(({ key, name, array }) => (
								<li
									key={key}
									className="flex items-center gap-1 hover:bg-primary/10 cursor-pointer px-2 py-1 text-sm text-muted-foreground"
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
				</div>
				<div className="flex-1 flex h-full overflow-hidden border border-border">
					<Tabs defaultValue="Workflow.wks" className="flex-1 flex flex-col">
						<TabsList>
							<TabsTrigger value="Workflow.wks">Workflow.wks</TabsTrigger>
							<TabsTrigger value="Draft.agt">Draft.agt</TabsTrigger>
						</TabsList>
						<TabsContent
							value="Workflow.wks"
							className="w-full h-full flex flex-col"
						>
							<div className="bg-secondary py-1 px-1">
								{requiredActions == null ? null : requiredActions.length > 0 ? (
									<div className="text-muted-foreground flex items-center gap-1 text-xs">
										<CircleAlertIcon className="w-4 h-4" />
										<p>{requiredActions.map(({ type }) => type).join(", ")}</p>
									</div>
								) : (
									<>
										<RequestButton onClick={handleSubmitRequest} />
										<ServerComponent />
									</>
								)}
							</div>
							<div className="flex-1" ref={containerRef}>
								<ReactFlow
									onContextMenu={handleContextMenu}
									onPaneClick={hideContextMenu}
									onNodesChange={handleNodesChange}
									defaultNodes={[]}
									defaultEdges={[]}
									onNodesDelete={(nodes) => {
										deleteNodes({
											deleteNodeIds: nodes.map((node) =>
												Number.parseInt(node.id),
											),
										});
									}}
									onConnect={({
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
											return;
										}
										addEdge({
											originPort: {
												id: Number.parseInt(sourceHandle),
												nodeId: Number.parseInt(source),
											},
											destinationPort: {
												id: Number.parseInt(targetHandle),
												nodeId: Number.parseInt(target),
											},
										});
									}}
									onEdgesDelete={(edges) => {
										deleteEdges({
											deleteEdgeIds: edges.map((edge) =>
												Number.parseInt(edge.id),
											),
										});
									}}
									nodeTypes={nodeTypes}
									onInit={setReactFlowInstance}
									onNodeDragStop={(_event, _node, nodes) => {
										updateNodesPosition({
											nodes: nodes.map((node) => ({
												id: Number.parseInt(node.id),
												position: {
													x: node.position.x,
													y: node.position.y,
												},
											})),
										});
									}}
								>
									<Background
										variant={BackgroundVariant.Dots}
										className="bg-gradient-to-b from-zinc-900/80 to-zinc-900/20"
									/>
									<Controls />
									<Panel position="top-right" className="bottom-0">
										<div className="flex gap-2 h-full">
											{request && <RequestLogger request={request} />}
											{selectedNodes.length > 0 && (
												<PropertyPanel selectedNodes={selectedNodes} />
											)}
										</div>
									</Panel>

									{isVisible && (
										<div
											className="z-10 absolute"
											style={{
												left:
													position.x - (containerRef?.current?.offsetLeft ?? 0),
												top:
													position.y - (containerRef?.current?.offsetTop ?? 0),
											}}
										>
											<EditorDropdownMenu onSelect={handleNodeSelect} />
										</div>
									)}
								</ReactFlow>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	);
};

export default function Page({ params }: { params: { urlId: string } }) {
	const { latestBlueprintGlance } = useLatestBlueprintGlance(params.urlId);
	return (
		<ReactFlowProvider>
			<BlueprintIdProvider blueprintId={latestBlueprintGlance?.id}>
				<NodeClassesProvider>
					<WorkflowEditor />
				</NodeClassesProvider>
			</BlueprintIdProvider>
		</ReactFlowProvider>
	);
}
