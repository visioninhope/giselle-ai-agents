import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import type { Graph, Node, NodeId } from "../types";
import { useGraph } from "./graph";

interface GraphSelectionContextValue {
	selectedNodeIds: Set<NodeId>;
	selectedNodes: Node[];
	selectedNode: Node | null;
}

const GraphSelectionContext = createContext<
	GraphSelectionContextValue | undefined
>(undefined);

export function GraphSelectionContextProvider({
	children,
}: {
	children: ReactNode;
}) {
	const { graph } = useGraph();
	const [selectedNodeIds, setSelectedNodeIds] = useState<Set<NodeId>>(
		new Set(),
	);

	const selectedNodes = useMemo(
		() => graph.nodes.filter((node) => node.selected),
		[graph.nodes],
	);
	const selectedNode = useMemo(
		() => (selectedNodes.length === 1 ? selectedNodes[0] : null),
		[selectedNodes],
	);

	return (
		<GraphSelectionContext.Provider
			value={{
				selectedNodeIds,
				selectedNodes,
				selectedNode,
			}}
		>
			{children}
		</GraphSelectionContext.Provider>
	);
}

export function useGraphSelection() {
	const context = useContext(GraphSelectionContext);
	if (context === undefined) {
		throw new Error(
			"useGraphSelection must be used within a GraphSelectionProvider",
		);
	}
	return context;
}
