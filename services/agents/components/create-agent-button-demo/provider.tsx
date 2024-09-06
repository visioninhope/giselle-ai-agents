"use client";

import type { FC, PropsWithChildren } from "react";
import type { AgentId } from "../../types";
import { CreateAgentButtonContext } from "./context";

type CreateAgentButtonContextProviderProps = {
	userId: string;
	onCreateAgentEnd: (agentId: AgentId) => void;
};
export const CreateAgentButtonContextProvider: FC<
	PropsWithChildren<CreateAgentButtonContextProviderProps>
> = ({ children, userId, onCreateAgentEnd }) => {
	return (
		<CreateAgentButtonContext.Provider value={{ userId, onCreateAgentEnd }}>
			{children}
		</CreateAgentButtonContext.Provider>
	);
};
