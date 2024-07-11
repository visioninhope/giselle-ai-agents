import type { GET } from "@/app/api/nodeDefs/route";
import type { InferResponse } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

export const useNodeDefs = () => {
	const { data } = useSWR<InferResponse<typeof GET>>("/api/nodeDefs", fetcher);
	return { nodeDefs: data?.nodeDefs };
};
