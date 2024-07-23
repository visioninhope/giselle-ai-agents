"use client";

import {
	type FC,
	type PropsWithChildren,
	createContext,
	useContext,
} from "react";
import type { AgentRequest } from "../agent-request";

const RequestInternalContext = createContext<AgentRequest | null>(null);

type RequestProviderProps = {
	request: AgentRequest;
};

export const RequestProvider: FC<PropsWithChildren<RequestProviderProps>> = ({
	request,
	children,
}) => {
	return (
		<RequestInternalContext.Provider value={request}>
			{children}
		</RequestInternalContext.Provider>
	);
};

export const useRequest = (): AgentRequest | null => {
	const request = useContext(RequestInternalContext);
	if (request === null) {
		return null;
	}
	return request;
};
