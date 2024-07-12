"use client";

import React, {
	createContext,
	type FC,
	type PropsWithChildren,
	useContext,
	useState,
} from "react";
import invariant from "tiny-invariant";

const AgentUrlIdContext = createContext<string | null>(null);

export const AgentUrlIdProvider: FC<PropsWithChildren<{ urlId: string }>> = ({
	children,
	urlId,
}) => {
	return (
		<AgentUrlIdContext.Provider value={urlId}>
			{children}
		</AgentUrlIdContext.Provider>
	);
};

export const useAgentUrlId = () => {
	const urlId = useContext(AgentUrlIdContext);
	invariant(
		urlId !== null,
		"useWorkspaceSlugContext is used in WorkspaceSlugContextProvider",
	);
	return urlId;
};
