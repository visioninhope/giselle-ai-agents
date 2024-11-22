import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import type { Graph, Node, NodeId } from "../types";

interface GraphSelectionContextValue {
	selectedNodeIds: Set<NodeId>;
	selectedNodes: Node[];
	selectedNode: Node | null;
	selectNode: (nodeId: NodeId, selected: boolean) => void;
}

const GraphSelectionContext = createContext<
	GraphSelectionContextValue | undefined
>(undefined);

export function GraphSelectionContextProvider({
	children,
	graph,
}: {
	children: ReactNode;
	graph: Graph;
}) {
	const [selectedNodeIds, setSelectedNodeIds] = useState<Set<NodeId>>(
		new Set(),
	);

	const selectNode = useCallback((nodeId: NodeId, selected: boolean) => {
		setSelectedNodeIds((prev) => {
			const next = new Set(prev);
			if (selected) {
				next.add(nodeId);
			} else {
				next.delete(nodeId);
			}
			return next;
		});
	}, []);

	const isSelected = useCallback(
		(nodeId: NodeId) => {
			return selectedNodeIds.has(nodeId);
		},
		[selectedNodeIds],
	);

	const selectedNodes = useMemo(
		() =>
			Array.from(selectedNodeIds)
				.map((id) => graph.nodes.find((node) => node.id === id))
				.filter((node) => node !== undefined),
		[selectedNodeIds, graph.nodes],
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
				selectNode,
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
