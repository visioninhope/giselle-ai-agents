import { OperationProvider } from "@/app/nodes";
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useReducer,
	useState,
} from "react";
import { type GraphAction, graphReducer } from "./graph-reducer";
import { setGraphToDb } from "./set-graph-to-db";
import type { PlaygroundGraph } from "./types";
import { useDebounce } from "./use-debounce";

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
	const [dirty, setDirty] = useState(false);
	const debounceSetGraphToDb = useDebounce(
		async (blueprintId: number, graph: PlaygroundGraph) => {
			await setGraphToDb(blueprintId, graph);
		},
		3000,
	);

	const dispatchWithMiddleware = useCallback((action: GraphAction) => {
		dispatch(action);
		setDirty(true);
	}, []);

	useEffect(() => {
		if (!dirty) {
			return;
		}
		debounceSetGraphToDb(1, graph);
	}, [graph, dirty, debounceSetGraphToDb]);

	return (
		<GraphContext.Provider value={{ graph, dispatch: dispatchWithMiddleware }}>
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
