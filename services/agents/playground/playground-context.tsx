"use client";

import {
	type FC,
	type PropsWithChildren,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useReducer,
	useState,
} from "react";
import { OperationProvider } from "../nodes";
import { RequestProvider, type RequestRunnerProvider } from "../requests";
import type { AgentId } from "../types";
import { getGraphFromDb } from "./get-graph-from-db";
import { type PlaygroundAction, playgroundReducer } from "./playground-reducer";
import { setGraphToDb } from "./set-graph-to-db";
import type { PlaygroundGraph } from "./types";
import { useDebounce } from "./use-debounce";

export const playgroundState = {
	initialize: "initialize",
	idle: "idle",
	saving: "saving",
} as const;
type PlaygroundState = (typeof playgroundState)[keyof typeof playgroundState];
type PlaygroundContextState = {
	graph: PlaygroundGraph;
	dispatch: React.Dispatch<PlaygroundAction>;
	state: PlaygroundState;
	agentId: AgentId;
};

const PlaygroundContext = createContext<PlaygroundContextState | undefined>(
	undefined,
);

export type PlaygroundProviderProps = {
	agentId: AgentId;
	userId: string;
	requestRunnerProvider: RequestRunnerProvider;
};
export const PlaygroundProvider: FC<
	PropsWithChildren<PlaygroundProviderProps>
> = ({ agentId, requestRunnerProvider, children }) => {
	const [graph, dispatch] = useReducer(playgroundReducer, {
		nodes: [],
		edges: [],
		viewport: {
			x: 0,
			y: 0,
			zoom: 1,
		},
	});
	const [dirty, setDirty] = useState(false);
	const [state, setState] = useState<PlaygroundState>(
		playgroundState.initialize,
	);
	const debounceSetGraphToDb = useDebounce(
		async (agentId: AgentId, graph: PlaygroundGraph) => {
			await setGraphToDb(agentId, graph);
		},
		2000,
	);

	const dispatchWithMiddleware = useCallback((action: PlaygroundAction) => {
		dispatch(action);
		setDirty(true);
	}, []);

	useEffect(() => {
		if (!dirty) {
			return;
		}
		debounceSetGraphToDb(agentId, graph);
	}, [graph, dirty, debounceSetGraphToDb, agentId]);

	useEffect(() => {
		getGraphFromDb(agentId).then((graph) => {
			dispatch({ type: "SET_GRAPH", graph });
			setState(playgroundState.idle);
		});
	}, [agentId]);

	return (
		<PlaygroundContext.Provider
			value={{
				graph,
				dispatch: dispatchWithMiddleware,
				state,
				agentId,
			}}
		>
			<OperationProvider
				addPort={(port) => {
					dispatchWithMiddleware({ type: "ADD_PORT", port });
				}}
				updatePort={(portId, updates) => {
					dispatchWithMiddleware({ type: "UPDATE_PORT", portId, updates });
				}}
				deletePort={(portId) => {
					dispatchWithMiddleware({ type: "REMOVE_PORT", portId });
				}}
				updateNode={(nodeId, updates) => {
					dispatchWithMiddleware({ type: "UPDATE_NODE", nodeId, updates });
				}}
			>
				<RequestProvider
					agentId={agentId}
					requestRunnerProvider={requestRunnerProvider}
				>
					{children}
				</RequestProvider>
			</OperationProvider>
		</PlaygroundContext.Provider>
	);
};

export const usePlayground = () => {
	const context = useContext(PlaygroundContext);
	if (context === undefined) {
		throw new Error("useGraph must be used within a GraphProvider");
	}
	return context;
};
