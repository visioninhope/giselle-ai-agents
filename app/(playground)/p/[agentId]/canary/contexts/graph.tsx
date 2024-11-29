import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState,
} from "react";
import type {
	Artifact,
	Connection,
	ConnectionId,
	Graph,
	Node,
	NodeHandleId,
	NodeId,
	Position,
} from "../types";

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

interface UpdateNodePositionActionInput {
	nodeId: NodeId;
	position: Position;
}
interface UpdateNodePositionAction {
	type: "updateNodePosition";
	input: UpdateNodePositionActionInput;
}
interface UpdateNodeSelectionActionInput {
	nodeId: NodeId;
	selected: boolean;
}
interface UpdateNodeSelectionAction {
	type: "updateNodeSelection";
	input: UpdateNodeSelectionActionInput;
}

interface AddConnectionActionInput {
	connection: Connection;
}
interface AddConnectionAction {
	type: "addConnection";
	input: AddConnectionActionInput;
}
interface RemoveConnectionActionInput {
	connectionId: ConnectionId;
}
interface RemoveConnectionAction {
	type: "removeConnection";
	input: RemoveConnectionActionInput;
}
type GraphAction =
	| UpsertArtifactAction
	| UpdateNodeAction
	| AddConnectionAction
	| RemoveConnectionAction
	| UpdateNodePositionAction
	| UpdateNodeSelectionAction;

export function upsertArtifact(
	input: UpsertArtifactActionInput,
): UpsertArtifactAction {
	return {
		type: "upsertArtifact",
		input,
	};
}

type GraphActionOrActions = GraphAction | GraphAction[];

function applyActions(
	graph: Graph,
	actionOrActions: GraphActionOrActions,
): Graph {
	const actions = Array.isArray(actionOrActions)
		? actionOrActions
		: [actionOrActions];
	let currentGraph = graph;
	for (const action of actions) {
		currentGraph = graphReducer(currentGraph, action);
	}
	return currentGraph;
}

interface GraphContextValue {
	graph: Graph;
	dispatch: (action: GraphActionOrActions) => void;
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
		case "addConnection":
			return {
				...graph,
				connections: [...graph.connections, action.input.connection],
			};
		case "removeConnection":
			return {
				...graph,
				connections: graph.connections.filter(
					(connection) => connection.id !== action.input.connectionId,
				),
			};
		case "updateNodePosition":
			return {
				...graph,
				nodes: graph.nodes.map((node) =>
					node.id === action.input.nodeId
						? { ...node, position: action.input.position }
						: node,
				),
			};
		case "updateNodeSelection":
			return {
				...graph,
				nodes: graph.nodes.map((node) =>
					node.id === action.input.nodeId
						? { ...node, selected: action.input.selected }
						: node,
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
	const dispatch = useCallback((actionOrActions: GraphActionOrActions) => {
		graphRef.current = applyActions(graphRef.current, actionOrActions);
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

export function useSelectedNode() {
	const {
		graph: { nodes },
	} = useGraph();
	const selectedNodes = useMemo(
		() => nodes.filter((node) => node.selected),
		[nodes],
	);
	const selectedNode = useMemo(
		() => (selectedNodes.length === 1 ? selectedNodes[0] : null),
		[selectedNodes],
	);
	return selectedNode;
}
