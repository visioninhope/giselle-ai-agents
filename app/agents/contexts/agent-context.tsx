"use client";

import type { agents } from "@/drizzle";
import {
	type FC,
	type PropsWithChildren,
	createContext,
	useContext,
	useOptimistic,
	useReducer,
	useTransition,
} from "react";
import { match } from "ts-pattern";

type Agent = typeof agents.$inferSelect;
type AgentAction = { type: "updateAgentName"; name: string } | { type: "noop" };
type MutateArgs<T extends AgentAction["type"]> = {
	optimistic: Omit<Extract<AgentAction, { type: T }>, "type">;
};
type ActionArgs<T extends AgentAction["type"], U> = MutateArgs<T> & {
	mutateResult: U;
};
type AgentActionContextInternalState = {
	mutateAgent: <T extends AgentAction["type"], U>(type: {
		type: T;
		optimistic: Omit<Extract<AgentAction, { type: T }>, "type">;
		mutate: (args: MutateArgs<T>) => Promise<U>;
		action: (args: ActionArgs<T, U>) => void;
	}) => void;
	isPending: boolean;
};

const reducer = (state: Agent, action: AgentAction): Agent =>
	match(action)
		.with({ type: "updateAgentName" }, () => state)
		.with({ type: "noop" }, () => state)
		.exhaustive();
const mutate = <T extends AgentAction["type"], U>(args: {
	type: T;
	optimistic: Omit<Extract<AgentAction, { type: T }>, "type">;
	mutate: (args: MutateArgs<T>) => Promise<U>;
	action: (args: ActionArgs<T, U>) => void;
}) => {};
mutate({
	type: "updateAgentName",
	optimistic: { name: "s" },
	mutate: async ({ optimistic }) => {
		optimistic.name;
		return {
			name: "string",
		};
	},
	action: ({ mutateResult, optimistic }) => {
		optimistic.name;
	},
});

const AgentInternalContext = createContext<Agent | null>(null);
const AgentActionContextInternal =
	createContext<AgentActionContextInternalState | null>(null);

type AgentProviderProps = {
	agent: Agent;
};
export const AgentProvider: FC<PropsWithChildren<AgentProviderProps>> = ({
	children,
	agent: defaultAgent,
}) => {
	const [isPending, startTransition] = useTransition();
	const [agent, setAgent] = useReducer(reducer, defaultAgent);

	const [optimisticBlueprint, setOptimisticBlueprintInternal] = useOptimistic<
		Agent,
		AgentAction
	>(agent, reducer);
	// const mutateAgent = <T extends AgentAction["type"], U>({
	// 	type,
	// 	optimistic,
	// 	mutate,
	// 	action,
	// }: {
	// 	type: T;
	// 	optimistic: Omit<Extract<AgentAction, { type: T }>, "type">;
	// 	mutate: (args: MutateArgs<T>) => Promise<U>;
	// 	action: (args: ActionArgs<T, U>) => void;
	// }) => {
	// 	startTransition(() => {
	// 		mutate({
	// 			type,
	// 			optimistic,
	// 			mutate: async ({ optimistic }) => {
	// 				const mutateResult = await mutate({ optimistic });
	// 				action({ mutateResult, optimistic });
	// 				return mutateResult;
	// 			},
	// 			action,
	// 		});
	// 	});
	// };
	return (
		<AgentInternalContext.Provider value={agent}>
			<AgentActionContextInternal.Provider value={null}>
				{children}
			</AgentActionContextInternal.Provider>
		</AgentInternalContext.Provider>
	);
};

export const useAgent = () => {
	const agent = useContext(AgentInternalContext);
	if (!agent) {
		throw new Error("useAgent must be used within a AgentProvider");
	}
	return agent;
};
