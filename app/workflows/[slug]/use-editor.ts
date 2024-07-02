import type { ResponseJson } from "@/app/api/workflows/[slug]/route";
import { useMemo } from "react";
import type { Edge, Node } from "reactflow";
import { NodeTypes } from "./node";

type EditorState = {
	nodes: Node[];
	edges: Edge[];
};
type UseEditorOprions = {
	workflow?: ResponseJson["workflow"];
};
export const useEditor = ({ workflow }: UseEditorOprions) => {
	const editorState = useMemo<EditorState>(() => {
		if (workflow == null) {
			return { nodes: [], edges: [] };
		}
		const nodes = workflow.nodes.map((node) => ({
			id: `${node.id}`,
			type: NodeTypes.V2,
			position: node.position,
			data: {
				structureKey: node.type,
			},
		}));
		const edges = workflow.edges.map(
			({ id, sourceNodeId, sourceHandleId, targetNodeId, targetHandleId }) => ({
				id: `${id}`,
				source: `${sourceNodeId}`,
				sourceHandle: sourceHandleId == null ? null : `${sourceHandleId}`,
				target: `${targetNodeId}`,
				targetHandle: targetHandleId == null ? null : `${targetHandleId}`,
			}),
		);
		return { nodes, edges };
	}, [workflow]);
	return {
		editorState,
	};
};
