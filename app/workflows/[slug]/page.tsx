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
	Panel,
} from "reactflow";

import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createId } from "@paralleldrive/cuid2";
import { PlayIcon } from "@radix-ui/react-icons";
import {
	ALargeSmallIcon,
	CircleIcon,
	GripIcon,
	LoaderCircleIcon,
	PlusIcon,
	WorkflowIcon,
} from "lucide-react";
import invariant from "tiny-invariant";
import { NodeTypes, useNodeTypes } from "./node";
import { type NodeStructureKey, nodeStructures } from "./node-list";
import type { NodeData } from "./nodev2";
import type { Context } from "./strcture";
import { useContextMenu } from "./use-context-menu";
import { useWorkflow } from "./use-workflow";
import { WorkflowRunner } from "./workflow-runner";

const initialNodes: Node[] = [
	{
		id: "find-user",
		type: NodeTypes.V2,
		data: {
			structureKey: "FindUser",
			runStatus: "success",
		},
		position: { x: 10, y: 10 },
	},
	{
		id: "send-mail",
		type: NodeTypes.V2,
		data: {
			structureKey: "SendMail",
			runStatus: "running",
		},
		position: { x: 300, y: 10 },
	},
];
const initialEdges: Edge[] = [
	{
		id: "edge-1",
		source: "find-user",
		target: "send-mail",
	},
];
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
	const { latestRun, run } = useWorkflow();

	const [reactFlowInstance, setReactFlowInstance] =
		useState<ReactFlowInstance | null>(null);
	const onConnect = useCallback<OnConnect>(
		(params) => setEdges((eds) => addEdge(params, eds)),
		[setEdges],
	);
	const handleNodeSelect = useCallback(
		(key: NodeStructureKey, data?: unknown) => {
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
						...(data ?? {}),
					},
				},
			]);
		},
		[hideContextMenu, position, reactFlowInstance, setNodes],
	);

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
								<PlusIcon className="w-4 h-4" />
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
								<Button
									variant={"ghost"}
									size={"xs"}
									className="text-muted-foreground"
									onClick={() => run()}
								>
									<PlayIcon className="mr-1" />
									Run Workflow
								</Button>
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
										className="bg-gradient-to-b from-zinc-900/80 to-zinc-900/20"
									/>
									<Controls />
									{latestRun && (
										<Panel position="top-right">
											<WorkflowRunner run={latestRun} />
										</Panel>
									)}

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
											<DropdownMenu defaultOpen={true} modal={false}>
												<DropdownMenuTrigger />
												<DropdownMenuContent>
													<DropdownMenuGroup>
														<DropdownMenuLabel>
															CREATE BASIC NODE
														</DropdownMenuLabel>
														<DropdownMenuItem
															onSelect={() =>
																handleNodeSelect("TextGeneration")
															}
														>
															<div className="flex items-center gap-2">
																<WorkflowIcon className="w-6 h-6" />
																<div>AI Agent</div>
															</div>
														</DropdownMenuItem>
													</DropdownMenuGroup>
													<DropdownMenuSeparator />
													<DropdownMenuGroup>
														<DropdownMenuLabel>
															CREATE ADVANCED NODE
														</DropdownMenuLabel>
														<DropdownMenuItem
															onSelect={() => handleNodeSelect("Loop")}
														>
															Loop
														</DropdownMenuItem>
														<DropdownMenuItem
															onSelect={() =>
																handleNodeSelect("CreateDocument")
															}
														>
															Create Document
														</DropdownMenuItem>
														<DropdownMenuSub>
															<DropdownMenuSubTrigger>
																Read Context
															</DropdownMenuSubTrigger>
															<DropdownMenuPortal>
																<DropdownMenuSubContent>
																	{contexts.map(({ key, name }) => (
																		<DropdownMenuItem
																			key={key}
																			onSelect={() =>
																				handleNodeSelect("Context", {
																					label: name,
																				})
																			}
																		>
																			{name}
																		</DropdownMenuItem>
																	))}
																</DropdownMenuSubContent>
															</DropdownMenuPortal>
														</DropdownMenuSub>
														<DropdownMenuSub>
															<DropdownMenuSubTrigger>
																Set Valut to Context
															</DropdownMenuSubTrigger>
															<DropdownMenuPortal>
																<DropdownMenuSubContent>
																	{contexts.map(({ key, name }) => (
																		<DropdownMenuItem
																			key={key}
																			onSelect={() =>
																				handleNodeSelect(
																					"AppendValueToContext",
																					{
																						label: name,
																					},
																				)
																			}
																		>
																			{name}
																		</DropdownMenuItem>
																	))}
																</DropdownMenuSubContent>
															</DropdownMenuPortal>
														</DropdownMenuSub>
													</DropdownMenuGroup>
													<DropdownMenuSeparator />
													<DropdownMenuGroup>
														<DropdownMenuLabel>
															CREATE TEST NODE
														</DropdownMenuLabel>
														<DropdownMenuItem
															onSelect={() => handleNodeSelect("FindUser")}
														>
															Find User
														</DropdownMenuItem>
														<DropdownMenuItem
															onSelect={() => handleNodeSelect("SendMail")}
														>
															Send Mail
														</DropdownMenuItem>
													</DropdownMenuGroup>
												</DropdownMenuContent>
											</DropdownMenu>
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

export default function Page({ params }: { params: { slug: string } }) {
	return (
		<ReactFlowProvider>
			<WorkflowEditor />
		</ReactFlowProvider>
	);
}
