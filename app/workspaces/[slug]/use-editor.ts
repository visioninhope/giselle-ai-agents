import type { GET } from "@/app/api/workspaces/[slug]/workflows/[workflowId]/route";
import type { StepWithNodeAndRunStep } from "@/app/api/workspaces/[slug]/workflows/types";
import type { WorkspaceWithNodeAndEdge } from "@/drizzle/db";
import type { InferResponse } from "@/lib/api";
import { useMemo } from "react";
import type { Edge, Node } from "reactflow";
import { NodeTypes } from "./node";

type EditorState = {
	nodes: Node[];
	edges: Edge[];
};
type UseEditorOprions = {
	workspace?: WorkspaceWithNodeAndEdge;
	workflow?: InferResponse<typeof GET>;
};
export const useEditor = ({ workspace, workflow }: UseEditorOprions) => {
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
				type: NodeTypes.V2,
				position: node.position,
				data: {
					structureKey: node.type,
					runStatus: runningStep?.runStep.status,
				},
			};
		});
		const edges = workspace.edges.map(
			({ id, sourceNodeId, sourceHandleId, targetNodeId, targetHandleId }) => ({
				id: `${id}`,
				source: `${sourceNodeId}`,
				sourceHandle: sourceHandleId == null ? null : `${sourceHandleId}`,
				target: `${targetNodeId}`,
				targetHandle: targetHandleId == null ? null : `${targetHandleId}`,
			}),
		);
		return { nodes, edges };
	}, [workspace, workflow?.steps]);
	return {
		editorState,
	};
};
