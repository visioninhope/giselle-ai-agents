import type { GraphAction } from "./actions";
import type { GraphState } from "./types";

export const graphReducer = (
	state: GraphState,
	action: GraphAction,
): GraphState => {
	switch (action.type) {
		case "addNode":
			return {
				...state,
				graph: {
					...state.graph,
					nodes: [...state.graph.nodes, action.payload.node],
				},
			};
		case "addConnector":
			return {
				...state,
				graph: {
					...state.graph,
					connectors: [...state.graph.connectors, action.payload.connector],
				},
			};
		default:
			return state;
	}
};
