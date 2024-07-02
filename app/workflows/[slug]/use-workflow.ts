import type { ResponseJson } from "@/app/api/workflows/[slug]/route";
import { fetcher, typedFetcher } from "@/lib/fetcher";
import { useCallback, useMemo, useState } from "react";
import type { Edge, Node } from "reactflow";
import useSWR from "swr";
import { NodeTypes } from "./node";
import type { Run } from "./run";

export const useWorkflowRunner = () => {
	const [latestRun, setLatestRun] = useState<Run | null>(null);
	const run = useCallback(() => {
		setLatestRun({
			steps: [
				{
					id: "find-user",
					title: "Find User",
					time: "1s",
					status: "running",
				},
				{
					id: "send-mail",
					title: "Send Mail",
					status: "idle",
				},
			],
		});
	}, []);
	return {
		run,
		latestRun,
	};
};

type EditorState = {
	nodes: Node[];
	edges: Edge[];
};

export const useWorkflow = (slug: string) => {
	const { data, error, isLoading, mutate } = useSWR(
		`/api/workflows/${slug}`,
		typedFetcher<ResponseJson>,
	);
	const editorState = useMemo<EditorState>(() => {
		if (isLoading || data == null) {
			return { nodes: [], edges: [] };
		}
		const nodes = data.workflow.nodes.map((node) => ({
			id: `${node.id}`,
			type: NodeTypes.V2,
			position: node.position,
			data: {
				structureKey: node.type,
			},
		}));
		const edges = data.workflow.edges.map(
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

	return { editorState };
};
