import { type NodeType, getNodeDef } from "@/app/api/nodeDefs";
import type { NodeWithPort } from "@/drizzle/db";
import { useCallback, useMemo } from "react";
import type { Edge, Node } from "reactflow";
import { NodeTypes } from "../node";
import { useAgent } from "../use-agent";
import { useBlueprint } from "../use-blueprint";
import { useNodeDefs } from "../use-node-defs";

type EditorState = {
	nodes: Node[];
	edges: Edge[];
};
type AddNodeArgs = {
	nodeType: NodeType;
	position: { x: number; y: number };
};
type DeleteNodesArgs = number[];
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const useEditor = () => {
	const { mutateBlueprint, blueprint } = useBlueprint();
	const { runningAgent } = useAgent();
	const { nodeDefs } = useNodeDefs();
	const editorState = useMemo<EditorState>(() => {
		if (blueprint == null) {
			return { nodes: [], edges: [] };
		}
		const nodes = blueprint.nodes.map((node) => {
			const relevantProcess = runningAgent?.latestRun?.processes.find(
				(process) => process.node.id === node.id,
			);
			return {
				id: `${node.id}`,
				type: NodeTypes.V3,
				position: node.position,
				data: {
					id: `${node.id}`,
					nodeType: node.type,
					runStatus: relevantProcess?.run.status,
					inputPorts: node.inputPorts,
					outputPorts: node.outputPorts,
				},
			};
		});
		const edges = blueprint.edges.map(({ id, inputPort, outputPort }) => ({
			id: `${id}`,
			source: `${outputPort.nodeId}`,
			sourceHandle: `${outputPort.id}`,
			target: `${inputPort.nodeId}`,
			targetHandle: `${inputPort.id}`,
		}));
		return { nodes, edges };
	}, [blueprint, runningAgent]);

	const addNode = useCallback(
		({ nodeType, position }: AddNodeArgs) => {
			if (blueprint == null) {
				return;
			}
			if (nodeDefs == null) {
				return;
			}
			const nodeDef = getNodeDef(nodeType);
			const newNode: NodeWithPort = {
				id: blueprint.nodes.length + 1,
				position,
				type: nodeType,
				inputPorts: (nodeDef.inputPorts ?? []).map(
					({ type, label }, index) => ({
						id: index,
						type: type,
						name: label ?? "",
					}),
				),
				outputPorts: (nodeDef.outputPorts ?? []).map(
					({ type, label }, index) => ({
						id: index,
						type: type,
						name: label ?? "",
					}),
				),
			};
			mutateBlueprint(
				async (prev) => {
					if (prev == null) {
						return { blueprint };
					}
					await fetch(`/api/workspaces/${blueprint.id}/nodes`, {
						method: "POST",
						body: JSON.stringify({ node: newNode }),
					});
					return {
						blueprint: {
							...prev.blueprint,
							nodes: [...prev.blueprint.nodes, newNode],
						},
					};
				},
				{
					optimisticData: (prev) => {
						if (prev == null) {
							return { blueprint };
						}
						return {
							blueprint: {
								...prev.blueprint,
								nodes: [...prev.blueprint.nodes, newNode],
							},
						};
					},
				},
			);
		},
		[blueprint, mutateBlueprint, nodeDefs],
	);

	const deleteNodes = useCallback(
		(deleteNodeIds: DeleteNodesArgs) => {
			if (blueprint == null) {
				return;
			}
			mutateBlueprint(
				sleep(2000).then(() => ({
					blueprint,
				})),
				{
					optimisticData: (prev) => {
						if (prev == null) {
							return { blueprint };
						}
						return {
							blueprint: {
								...prev.blueprint,
								nodes: prev.blueprint.nodes.filter(
									(node) => !deleteNodeIds.includes(node.id),
								),
							},
						};
					},
				},
			);
		},
		[blueprint, mutateBlueprint],
	);

	return {
		editorState,
		addNode,
		deleteNodes,
	};
};
