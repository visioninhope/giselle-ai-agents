"use client";

import { useMemo, useState } from "react";
import { useRequestData } from "./[requestId]";
import { type AgentRequest, assertAgentRequest } from "./agent-request";
import { useCreateRequestAction } from "./create-request";

export const useRequest = () => {
	const [requestId, setRequestId] = useState<number | undefined>(undefined);
	const [requestOptimisticdata, setRequestOptimisticdata] = useState<
		AgentRequest | undefined
	>(undefined);
	const { request: requestData } = useRequestData(requestId);
	const { createRequest } = useCreateRequestAction({
		onRequestCreated: (request) => {
			setRequestId(request.id);
		},
	});
	const request = useMemo(
		() => requestData || requestOptimisticdata,
		[requestData, requestOptimisticdata],
	);
	return { request, createRequest };
};
