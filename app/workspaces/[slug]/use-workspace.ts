import type { GET } from "@/app/api/workspaces/[slug]/route";
import type { InferResponse } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import { useCallback } from "react";
import useSWR from "swr";
import invariant from "tiny-invariant";
import { useWorkspaceSlug } from "./use-workspace-slug";

export const getWorkspaceRequestKey = (slug: string) =>
	`/api/workspaces/${slug}`;

type ApiResponse = InferResponse<typeof GET>;

export const useWorkspace = () => {
	const slug = useWorkspaceSlug();
	const { data, mutate } = useSWR<ApiResponse>(
		getWorkspaceRequestKey(slug),
		fetcher,
	);
	const mutateWorkspace = mutate;

	return { workspace: data?.workspace, mutateWorkspace };
};
