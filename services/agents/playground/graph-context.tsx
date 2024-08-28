import {
	type PropsWithChildren,
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useReducer,
	useState,
} from "react";
import { OperationProvider } from "../nodes";
import type { AgentId } from "../types";
import { getGraphFromDb } from "./get-graph-from-db";
import { type GraphAction, graphReducer } from "./graph-reducer";
import { setGraphToDb } from "./set-graph-to-db";
import type { PlaygroundGraph } from "./types";
import { useDebounce } from "./use-debounce";

export const graphState = {
	initialize: "initialize",
	idle: "idle",
	saving: "saving",
} as const;
type GraphState = (typeof graphState)[keyof typeof graphState];
type GraphContextType = {
	graph: PlaygroundGraph;
	dispatch: React.Dispatch<GraphAction>;
	state: GraphState;
	agentId: AgentId;
};

const GraphContext = createContext<GraphContextType | undefined>(undefined);

type GraphProviderProps = {
	agentId: AgentId;
};
export const GraphProvider: React.FC<PropsWithChildren<GraphProviderProps>> = ({
	agentId,
	children,
}) => {
	const [graph, dispatch] = useReducer(graphReducer, {
		nodes: [],
		edges: [],
		viewport: {
			x: 0,
			y: 0,
			zoom: 1,
		},
	});
	const [dirty, setDirty] = useState(false);
	const [state, setState] = useState<GraphState>(graphState.initialize);
	const debounceSetGraphToDb = useDebounce(
		async (agentId: AgentId, graph: PlaygroundGraph) => {
			await setGraphToDb(agentId, graph);
		},
		2000,
	);

	const dispatchWithMiddleware = useCallback((action: GraphAction) => {
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
			setState(graphState.idle);
		});
	}, [agentId]);

	return (
		<GraphContext.Provider
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
				{children}
			</OperationProvider>
		</GraphContext.Provider>
	);
};

export const useGraph = () => {
	const context = useContext(GraphContext);
	if (context === undefined) {
		throw new Error("useGraph must be used within a GraphProvider");
	}
	return context;
};
