import { type FC, type PropsWithChildren, useReducer } from "react";
import { GraphContext } from "./context";
import { graphReducer } from "./reducer";

const initialState = {
	graph: {
		nodes: [],
	},
};

export const GraphProvider: FC<PropsWithChildren> = ({ children }) => {
	const [state, dispatch] = useReducer(graphReducer, initialState);
	return (
		<GraphContext.Provider value={{ state, dispatch }}>
			{children}
		</GraphContext.Provider>
	);
};
