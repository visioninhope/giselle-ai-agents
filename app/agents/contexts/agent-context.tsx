"use client";

import type { agents } from "@/drizzle";
import {
	type FC,
	type PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useOptimistic,
	useReducer,
	useTransition,
} from "react";
import { match } from "ts-pattern";

type AgentState = typeof agents.$inferSelect;
type AgentAction = { type: "updateAgentName"; name: string };
type AgentActionType = AgentAction["type"];
type AgentActionPayload<T extends AgentActionType> = Omit<
	Extract<AgentAction, { type: T }>,
	"type"
>;
type MutateAgentArgs<
	T extends AgentActionType,
	D extends AgentActionPayload<T>,
> = {
	type: T;
	action: (optimisticData: D) => Promise<AgentActionPayload<T>>;
	optimisticData: D;
};

const AgentContext = createContext<{
	agent: AgentState;
	mutate: <T extends AgentActionType, D extends AgentActionPayload<T>>(
		args: MutateAgentArgs<T, D>,
	) => void;
	isPending: boolean;
} | null>(null);

type AgentProviderProps = {
	agent: AgentState;
};
const reducer = (state: AgentState, action: AgentAction): AgentState =>
	match(action)
		.with({ type: "updateAgentName" }, ({ name }) => ({
			...state,
			name,
		}))
		.exhaustive();

export const AgentProvider: FC<PropsWithChildren<AgentProviderProps>> = ({
	agent: defaultAgent,
	children,
}) => {
	const [isPending, startTransition] = useTransition();
	const [agent, dispatch] = useReducer(reducer, defaultAgent);
	const [optimisticAgent, setOptimisticBlueprint] = useOptimistic<
		AgentState,
		AgentAction
	>(agent, reducer);
	const mutate = useCallback(
		<T extends AgentActionType, D extends AgentActionPayload<T>>(
			args: MutateAgentArgs<T, D>,
		) => {
			startTransition(async () => {
				const { type, action, optimisticData } = args;
				/** @todo remove type assertion */
				setOptimisticBlueprint({ ...optimisticData, type } as AgentAction);
				const result = await action(optimisticData);
				/** @todo remove type assertion */
				dispatch({ ...optimisticData, type } as AgentAction);
			});
		},
		[setOptimisticBlueprint],
	);
	return (
		<AgentContext.Provider
			value={{
				agent: optimisticAgent,
				mutate,
				isPending,
			}}
		>
			{children}
		</AgentContext.Provider>
	);
};

export const useAgent = () => {
	const context = useContext(AgentContext);
	if (!context) {
		throw new Error("useAgent must be used within an AgentProvider");
	}
	return context;
};
