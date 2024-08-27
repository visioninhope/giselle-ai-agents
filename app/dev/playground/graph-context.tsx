import { OperationProvider } from "@/app/nodes";
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
			<OperationProvider
				addPort={(port) => {
					dispatch({ type: "ADD_PORT", port });
				}}
				updatePort={(portId, updates) => {
					dispatch({ type: "UPDATE_PORT", portId, updates });
				}}
				deletePort={(portId) => {
					dispatch({ type: "REMOVE_PORT", portId });
				}}
				updateNode={(nodeId, updates) => {
					dispatch({ type: "UPDATE_NODE", nodeId, updates });
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
