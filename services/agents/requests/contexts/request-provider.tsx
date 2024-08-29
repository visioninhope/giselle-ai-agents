"use client";

import {
	type FC,
	type PropsWithChildren,
	createContext,
	useCallback,
	useContext,
} from "react";
import type { AgentId } from "../../types";
import { createRequest, getOrBuildBlueprint } from "../process";
import { runOnTriggerDev, runOnVercel } from "../runners";
import type { RequestRunnerProvider, RequestStartHandler } from "../types";

type RequestProviderState = {
	requestStart: () => Promise<void>;
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
	const requestStart = useCallback(async () => {
		const blueprint = await getOrBuildBlueprint(agentId);
		const request = await createRequest(blueprint.id);
		switch (requestRunnerProvider) {
			case "vercelFunctions":
				await runOnVercel(request);
				return;
			case "triggerDev":
				await runOnTriggerDev(request);
				return;
		}
	}, [agentId, requestRunnerProvider]);
	return (
		<RequestContext.Provider value={{ requestStart }}>
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
