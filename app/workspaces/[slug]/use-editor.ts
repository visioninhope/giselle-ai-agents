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
	console.log({ editorState });
	return {
		editorState,
	};
};
