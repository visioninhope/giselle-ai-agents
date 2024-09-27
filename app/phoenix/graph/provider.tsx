import {
	type FC,
	type PropsWithChildren,
	useCallback,
	useReducer,
} from "react";
import { type EnhancedDispatch, GraphContext } from "./context";
import { graphReducer } from "./reducer";

const initialState = {
	graph: {
		nodes: [],
		connectors: [],
	},
};

export const GraphProvider: FC<PropsWithChildren> = ({ children }) => {
	const [state, originalDispatch] = useReducer(graphReducer, initialState);
	const enhancedDispatch: EnhancedDispatch = useCallback(
		(action) => {
			if (typeof action === "function") {
				// This is a thunk
				action(enhancedDispatch, () => state);
			} else {
				// This is a regular action
				originalDispatch(action);
			}
		},
		[state],
	);
	return (
		<GraphContext.Provider value={{ state, dispatch: enhancedDispatch }}>
			{children}
		</GraphContext.Provider>
	);
};
