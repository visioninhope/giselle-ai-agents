import type { InferResponse } from "@/lib/api";
import { fetcher } from "@/lib/fetcher";
import { useState } from "react";
import useSWR from "swr";
import invariant from "tiny-invariant";
import type { GET } from "./[requestId]/route";
import { assertAgentRequest } from "./agent-request";

const execApi = async () => {
	const request = await fetch("/agents/requests", {
		method: "POST",
	}).then((res) => res.json());
	assertAgentRequest(request);
	return request;
};

const requestKey = (requestId: number | undefined) => {
	if (requestId == null) {
		return false;
	}
	return `/agents/requests/${requestId}`;
};
export const useRequest = () => {
	const [requestId, setRequestId] = useState<number | undefined>(undefined);
	const { data, mutate } = useSWR<InferResponse<typeof GET>>(
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
	const sendRequest = () => {
		mutate(
			execApi().then(({ request }) => {
				setRequestId(request.id);
				return { request };
			}),
			{
				optimisticData: (prev) => {
					invariant(prev != null, "Previous data is missing");
					return {
						request: {
							...prev.request,
							status: "creating",
						},
					};
				},
			},
		);
	};
	return { sendRequest, request: data };
};
