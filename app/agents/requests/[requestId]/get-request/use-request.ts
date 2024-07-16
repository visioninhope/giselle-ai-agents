"use client";

import type { InferResponse } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import useSWR from "swr";
import type { GET } from "./route";

const requestKey = (requestId: number | undefined) => {
	if (requestId == null) {
		return false;
	}
	return `/agents/requests/${requestId}/get-request`;
};
export const useRequestData = (requestId: number | undefined) => {
	const { data } = useSWR<InferResponse<typeof GET>>(
		requestKey(requestId),
		fetcher,
		{
			refreshInterval: (latestData) => {
				if (
					latestData == null ||
					latestData.request == null ||
					latestData.request.status === "success"
				) {
					return 0;
				}
				return 1000;
			},
		},
	);
	return { request: data?.request };
};
