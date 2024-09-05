"use client";

import {
	type FC,
	type PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { AgentId } from "../types";
import { getRequest } from "./get-request";
import { buildPlaygroundGraph, createRequest } from "./process";
import { runOnTriggerDev, runOnVercel } from "./runners";
import {
	type Request,
	type RequestId,
	type RequestRunnerProvider,
	requestStatus,
} from "./types";

type RequestProviderState = {
	requestStartAction: () => Promise<void>;
	lastRequest?: Request | undefined | null;
};

const RequestContext = createContext<RequestProviderState | null>(null);

type RequestProviderProps = {
	agentId: AgentId;
	requestRunnerProvider: RequestRunnerProvider;
};
export const RequestProvider: FC<PropsWithChildren<RequestProviderProps>> = ({
	children,
	agentId,
	requestRunnerProvider,
}) => {
	const [requestId, setRequestId] = useState<RequestId | undefined>();
	const [lastRequest, setLastRequest] = useState<Request | undefined | null>();
	const requestStartAction = useCallback(async () => {
		const build = await buildPlaygroundGraph(agentId);
		const newRequest = await createRequest(build.id);
		setRequestId(newRequest.id);
		switch (requestRunnerProvider) {
			case "vercelFunctions":
				fetch(`/agents/requests/${newRequest.id}`, {
					method: "POST",
				});
				return;
			case "triggerDev":
				runOnTriggerDev({ requestId: newRequest.id });
				return;
		}
	}, [agentId, requestRunnerProvider]);

	useEffect(() => {
		if (requestId == null) {
			return;
		}

		let timeoutId: NodeJS.Timeout;

		async function pollingGetRequest(requestId: RequestId) {
			const request = await getRequest(requestId);
			setLastRequest(request);
			if (request != null && request.status === requestStatus.completed) {
				return; // ポーリング終了
			}
			// 次のポーリングをスケジュール
			timeoutId = setTimeout(() => pollingGetRequest(requestId), 2000);
		}

		pollingGetRequest(requestId);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [requestId]);
	return (
		<RequestContext.Provider value={{ requestStartAction, lastRequest }}>
			{children}
		</RequestContext.Provider>
	);
};

export const useRequest = () => {
	const context = useContext(RequestContext);
	if (!context) {
		throw new Error("useRequest must be used within a RequestProvider");
	}
	return context;
};
