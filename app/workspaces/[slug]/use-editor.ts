import { type NodeType, getNodeDef } from "@/app/api/nodeDefs";
import type { GET } from "@/app/api/workspaces/[slug]/workflows/[workflowId]/route";
import type { NodeWithPort, WorkspaceWithNodeAndEdge } from "@/drizzle/db";
import type { InferResponse } from "@/lib/api";
import { useCallback, useMemo } from "react";
import type { Edge, Node } from "reactflow";
import { NodeTypes } from "./node";
import { useNodeDefs } from "./use-node-defs";
import { useWorkspace } from "./use-workspace";

type EditorState = {
	nodes: Node[];
	edges: Edge[];
};
type UseEditorOprions = {
	workspace?: WorkspaceWithNodeAndEdge;
	workflow?: InferResponse<typeof GET>;
};
type AddNodeArgs = {
	nodeType: NodeType;
	position: { x: number; y: number };
};
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export const useEditor = ({ workspace, workflow }: UseEditorOprions) => {
	const { mutateWorkspace } = useWorkspace();
	const { nodeDefs } = useNodeDefs();
	const editorState = useMemo<EditorState>(() => {
		if (workspace == null) {
			return { nodes: [], edges: [] };
		}
		const nodes = workspace.nodes.map((node) => {
			const runningStep = workflow?.steps.find(
				(step) => step.nodeId === node.id,
			);
			return {
				id: `${node.id}`,
				type: NodeTypes.V3,
				position: node.position,
				data: {
					id: `${node.id}`,
					nodeType: node.type,
					runStatus: runningStep?.runStep.status,
					inputPorts: node.inputPorts,
					outputPorts: node.outputPorts,
				},
			};
		});
		const edges = workspace.edges.map(({ id, inputPort, outputPort }) => ({
			id: `${id}`,
			source: `${outputPort.nodeId}`,
			sourceHandle: `${outputPort.id}`,
			target: `${inputPort.nodeId}`,
			targetHandle: `${inputPort.id}`,
		}));
		return { nodes, edges };
	}, [workspace, workflow?.steps]);

	const addNode = useCallback(
		({ nodeType, position }: AddNodeArgs) => {
			if (workspace == null) {
				return;
			}
			if (nodeDefs == null) {
				return;
			}
			const nodeDef = getNodeDef(nodeType);
			const newNode: NodeWithPort = {
				id: workspace.nodes.length + 1,
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
			mutateWorkspace(
				async (prev) => {
					if (prev == null) {
						return { workspace };
					}
					await fetch(`/api/workspaces/${workspace.slug}/nodes`, {
						method: "POST",
						body: JSON.stringify({ node: newNode }),
					});
					return {
						workspace: {
							...prev.workspace,
							nodes: [...prev.workspace.nodes, newNode],
						},
					};
				},
				{
					optimisticData: (prev) => {
						if (prev == null) {
							return { workspace };
						}
						return {
							workspace: {
								...prev.workspace,
								nodes: [...prev.workspace.nodes, newNode],
							},
						};
					},
				},
			);
		},
		[workspace, mutateWorkspace, nodeDefs],
	);

	return {
		editorState,
		addNode,
	};
};
