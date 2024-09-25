import { type Dispatch, createContext, useContext } from "react";
import type { GraphAction } from "./actions";
import type { GraphState } from "./types";

export type GraphContext = {
	state: GraphState;
	dispatch: Dispatch<GraphAction>;
};

export const GraphContext = createContext<GraphContext | undefined>(undefined);

export const useGraph = () => {
	const context = useContext(GraphContext);
	if (!context) {
		throw new Error("useGraph must be used within a GraphProvider");
	}
	return context;
};
