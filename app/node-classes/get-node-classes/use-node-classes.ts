"use client";

import type { InferResponse } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
import type { GET } from "./route";

export const useNodeClasses = () => {
	const { data } = useSWR<InferResponse<typeof GET>>(
		"/node-classes/get-node-classes",
		fetcher,
	);
	return { nodeClasses: data?.nodeClasses };
};
