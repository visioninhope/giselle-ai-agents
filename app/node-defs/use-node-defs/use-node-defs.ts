import type { GET } from "@/app/node-defs/use-node-defs/route";
import type { InferResponse } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";

export const useNodeDefs = () => {
	const { data } = useSWR<InferResponse<typeof GET>>(
		"/node-defs/use-node-defs",
		fetcher,
	);
	return { nodeDefs: data?.nodeDefs };
};
