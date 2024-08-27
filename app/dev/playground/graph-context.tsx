import { type ReactNode, createContext, useContext, useReducer } from "react";
import { type GraphAction, graphReducer } from "./graph-reducer";
import type { PlaygroundGraph } from "./types";

type GraphContextType = {
	graph: PlaygroundGraph;
	dispatch: React.Dispatch<GraphAction>;
};

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider: React.FC<{
	children: ReactNode;
	initialGraph: PlaygroundGraph;
}> = ({ children, initialGraph }) => {
	const [graph, dispatch] = useReducer(graphReducer, initialGraph);

	return (
		<GraphContext.Provider value={{ graph, dispatch }}>
			{children}
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
