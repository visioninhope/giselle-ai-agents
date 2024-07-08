import type { GET } from "@/app/api/workspaces/[slug]/route";
import type { InferResponse } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import { useCallback } from "react";
import type { Edge, Node } from "reactflow";
import useSWR from "swr";

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
	const run = useCallback(() => {}, []);

	return { workspace: data?.workspace };
};
