import { type ReactNode, createContext, useContext, useMemo } from "react";
import type { Artifact, Graph, NodeHandleId, NodeId } from "../types";

interface GraphContextValue {
	graph: Graph;
}
const GraphContext = createContext<GraphContextValue | undefined>(undefined);

export function GraphContextProvider({
	children,
	graph,
}: {
	children: ReactNode;
	graph: Graph;
}) {
	return (
		<GraphContext.Provider value={{ graph }}>{children}</GraphContext.Provider>
	);
}

export function useGraph() {
	const context = useContext(GraphContext);
	if (context === undefined) {
		throw new Error("useGraph must be used within a GraphContextProvider");
	}
	return context.graph;
}

interface TargetHandle {
	targetNodeHandleId?: NodeHandleId;
}
export function useNode(query: TargetHandle) {
	const { nodes, connections } = useGraph();
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
	const { artifacts } = useGraph();
	const artifact = useMemo(() => {
		const createdArtifacts = artifacts.filter(
			(artifact) => artifact.creatorNodeId === query.creatorNodeId,
		);
		createdArtifacts.sort((a, b) => a.createdAt - b.createdAt);
		return createdArtifacts[0];
	}, [artifacts, query]);
	return artifact;
}
