"use client";

import { createContext, useContext } from "react";
import type { AgentId } from "../../types";

type CreateAgentButtonContext = {
	userId: string;
	onCreateAgentEnd: (agentId: AgentId) => void;
};

export const CreateAgentButtonContext =
	createContext<CreateAgentButtonContext | null>(null);

export const useCreateAgentButtonContext = () => {
	const context = useContext(CreateAgentButtonContext);
	if (!context) {
		throw new Error(
			"useCreateAgentButtonContext must be used within a CreateAgentButtonContext.Provider",
		);
	}
	return context;
};
