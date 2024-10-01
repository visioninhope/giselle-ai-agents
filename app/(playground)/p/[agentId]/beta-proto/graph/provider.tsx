import {
	type FC,
	type PropsWithChildren,
	useCallback,
	useReducer,
} from "react";
import type { AgentId } from "../types";
import { type EnhancedDispatch, GraphContext } from "./context";
import { graphReducer } from "./reducer";
import { setGraphToDb } from "./server-actions";
import type { Graph } from "./types";
import { useDebounce } from "./use-debounce";

const initialState = {
	graph: {
		nodes: [],
		connectors: [],
		artifacts: [],
	},
};

type GraphProviderProps = {
	agentId: AgentId;
	defaultGraph: Graph;
};

export const GraphProvider: FC<PropsWithChildren<GraphProviderProps>> = ({
	children,
	agentId,
	defaultGraph,
}) => {
	const [state, originalDispatch] = useReducer(graphReducer, {
		graph: defaultGraph,
	});

	const deboucedSetGraphToDb = useDebounce(async (graph: Graph) => {
		setGraphToDb(agentId, graph);
	}, 500);
	const enhancedDispatch: EnhancedDispatch = useCallback(
		(action) => {
			if (typeof action === "function") {
				// This is a thunk
				action(enhancedDispatch, () => state);
			} else {
				// This is a regular action
				console.log("regular action");
				originalDispatch(action);
				deboucedSetGraphToDb(graphReducer(state, action).graph);
			}
		},
		[state, deboucedSetGraphToDb],
	);
	return (
		<GraphContext.Provider value={{ state, dispatch: enhancedDispatch }}>
			{children}
		</GraphContext.Provider>
	);
};
