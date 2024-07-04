import type { GET } from "@/app/api/workspaces/[slug]/route";
import type { InferResponse } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import { useCallback, useMemo, useState } from "react";
import type { Edge, Node } from "reactflow";
import useSWR from "swr";
import { NodeTypes } from "./node";
import type { Run } from "./run";

type EditorState = {
	nodes: Node[];
	edges: Edge[];
};

export const getWorkspaceRequestKey = (slug: string) =>
	`/api/workspaces/${slug}`;

export const useWorkspace = (slug: string) => {
	const { data, isLoading } = useSWR<InferResponse<typeof GET>>(
		getWorkspaceRequestKey(slug),
		fetcher,
	);
	const editorState = useMemo<EditorState>(() => {
		if (isLoading || data == null) {
			return { nodes: [], edges: [] };
		}
		const nodes = data.workspace.nodes.map((node) => ({
			id: `${node.id}`,
			type: NodeTypes.V2,
			position: node.position,
			data: {
				structureKey: node.type,
			},
		}));
		const edges = data.workspace.edges.map(
			({ id, sourceNodeId, sourceHandleId, targetNodeId, targetHandleId }) => ({
				id: `${id}`,
				source: `${sourceNodeId}`,
				sourceHandle: sourceHandleId == null ? null : `${sourceHandleId}`,
				target: `${targetNodeId}`,
				targetHandle: targetHandleId == null ? null : `${targetHandleId}`,
			}),
		);
		return { nodes, edges };
	}, [isLoading, data]);

	const run = useCallback(() => {}, []);

	return { editorState, workspace: data?.workspace };
};
