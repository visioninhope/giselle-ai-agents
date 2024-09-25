import { createContext, useContext } from "react";
import type { GraphAction } from "./actions";
import type { GraphState } from "./types";

export type ThunkAction = (
	dispatch: EnhancedDispatch,
	getState: () => GraphState,
) => void;
export type EnhancedDispatch = (action: GraphAction | ThunkAction) => void;
export type GraphContext = {
	state: GraphState;
	dispatch: EnhancedDispatch;
};

export const GraphContext = createContext<GraphContext | undefined>(undefined);

export const useGraph = () => {
	const context = useContext(GraphContext);
	if (!context) {
		throw new Error("useGraph must be used within a GraphProvider");
	}
	return context;
};
