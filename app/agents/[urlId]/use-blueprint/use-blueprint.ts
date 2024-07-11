import type { InferResponse } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
import { useAgentUrlId } from "../use-agent-url-id";
import type { GET } from "./route";

export const getWorkspaceRequestKey = (urlId: string) =>
	`/agents/${urlId}/use-blueprint`;

type ApiResponse = InferResponse<typeof GET>;

export const useBlueprint = () => {
	const slug = useAgentUrlId();
	const { data, mutate } = useSWR<ApiResponse>(
		getWorkspaceRequestKey(slug),
		fetcher,
	);

	return { blueprint: data?.blueprint, mutateBlueprint: mutate };
};
