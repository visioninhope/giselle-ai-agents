"use client";

import { useRouter } from "next/navigation";
import {
	type FC,
	type PropsWithChildren,
	createContext,
	useContext,
	useEffect,
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
	const router = useRouter();
	useEffect(() => {
		if (request.status === "creating" || request.status === "running") {
			setTimeout(() => {
				router.refresh();
			}, 2000);
		}
	}, [request, router]);
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
