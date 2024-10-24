import {
	type FC,
	type PropsWithChildren,
	useCallback,
	useEffect,
	useReducer,
	useRef,
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
	const isInitialMount = useRef(true);

	const deboucedSetGraphToDb = useDebounce(async (graph: Graph) => {
		setGraphToDb(agentId, graph);
	}, 500);
	const enhancedDispatch: EnhancedDispatch = useCallback(
		async (action) => {
			if (typeof action === "function") {
				await action(enhancedDispatch, () => state);
			} else {
				originalDispatch(action);
			}
		},
		[state],
	);
	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			console.log({ a: state.graph });
		} else {
			console.log({ b: state.graph });
			deboucedSetGraphToDb(state.graph);
		}
	}, [state, deboucedSetGraphToDb]);
	return (
		<GraphContext.Provider value={{ state, dispatch: enhancedDispatch }}>
			{children}
		</GraphContext.Provider>
	);
};
