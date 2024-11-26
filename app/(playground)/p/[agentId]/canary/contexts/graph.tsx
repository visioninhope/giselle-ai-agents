import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import type { Artifact, Graph, Node, NodeHandleId, NodeId } from "../types";

interface UpsertArtifactActionInput {
	nodeId: NodeId;
	artifact: Artifact;
}
interface UpsertArtifactAction {
	type: "upsertArtifact";
	input: UpsertArtifactActionInput;
}

interface UpdateNodeActionInput {
	nodeId: NodeId;
	node: Node;
}
interface UpdateNodeAction {
	type: "updateNode";
	input: UpdateNodeActionInput;
}
type GraphAction = UpsertArtifactAction | UpdateNodeAction;

export function upsertArtifact(
	input: UpsertArtifactActionInput,
): UpsertArtifactAction {
	return {
		type: "upsertArtifact",
		input,
	};
}

interface GraphContextValue {
	graph: Graph;
	dispatch: (action: GraphAction) => void;
}
const GraphContext = createContext<GraphContextValue | undefined>(undefined);

function graphReducer(graph: Graph, action: GraphAction): Graph {
	switch (action.type) {
		case "upsertArtifact":
			return {
				...graph,
				artifacts: [
					...graph.artifacts.filter(
						(artifact) => artifact.creatorNodeId !== action.input.nodeId,
					),
					action.input.artifact,
				],
			};
		case "updateNode":
			return {
				...graph,
				nodes: graph.nodes.map((node) =>
					node.id === action.input.nodeId ? action.input.node : node,
				),
			};
		default:
			return graph;
	}
}

export function GraphContextProvider({
	children,
	defaultGraph,
}: {
	children: ReactNode;
	defaultGraph: Graph;
}) {
	const graphRef = useRef(defaultGraph);
	const [graph, setGraph] = useState(graphRef.current);
	const dispatch = useCallback((action: GraphAction) => {
		graphRef.current = graphReducer(graphRef.current, action);
		setGraph(graphRef.current);
	}, []);
	return (
		<GraphContext.Provider value={{ graph, dispatch }}>
			{children}
		</GraphContext.Provider>
	);
}

export function useGraph() {
	const context = useContext(GraphContext);
	if (context === undefined) {
		throw new Error("useGraph must be used within a GraphContextProvider");
	}
	return context;
}

interface TargetHandle {
	targetNodeHandleId?: NodeHandleId;
}
export function useNode(query: TargetHandle) {
	const {
		graph: { nodes, connections },
	} = useGraph();
	const node = useMemo(() => {
		const connection = connections.find(
			(connection) =>
				connection.targetNodeHandleId === query.targetNodeHandleId,
		);
		if (connection === undefined) {
			return null;
		}
		const node = nodes.find((node) => node.id === connection.sourceNodeId);
		if (node === undefined) {
			return null;
		}
		return node;
	}, [connections, nodes, query]);
	return node;
}

interface CreatorNode {
	creatorNodeId?: NodeId;
}
export function useArtifact(query: CreatorNode): Artifact | null {
	const {
		graph: { artifacts },
	} = useGraph();
	const artifact = useMemo(() => {
		const createdArtifacts = artifacts.filter(
			(artifact) => artifact.creatorNodeId === query.creatorNodeId,
		);
		return createdArtifacts[0];
	}, [artifacts, query]);
	return artifact;
}
