import {
	type edges as edgesSchema,
	type nodes as nodesSchema,
	workflows,
} from "@/drizzle/schema";
export type Node = typeof nodesSchema.$inferSelect;
type Edge = typeof edgesSchema.$inferSelect;

export type WorkflowData = {
	nodes: Node[];
	edges: Edge[];
};

export class Graph {
	private adjacencyList: Map<number, number[]>;
	private nodes: Map<number, Node>;

	constructor(workflowData: WorkflowData) {
		this.adjacencyList = new Map();
		this.nodes = new Map();
		this.buildGraph(workflowData);
	}

	private buildGraph(workflowData: WorkflowData): void {
		const { nodes, edges } = workflowData;

		// Add nodes to the graph
		for (const node of nodes) {
			this.addNode(node);
		}

		// Add edges to the graph
		for (const edge of edges) {
			this.addEdge(edge.sourceNodeId, edge.targetNodeId);
		}

		// Verify that the graph is acyclic
		if (!this.isAcyclic()) {
			throw new Error("The resulting graph is not a DAG (contains cycles)");
		}
	}

	private addNode(node: Node): void {
		this.nodes.set(node.id, node);
		if (!this.adjacencyList.has(node.id)) {
			this.adjacencyList.set(node.id, []);
		}
	}

	private addEdge(source: number, target: number): void {
		this.adjacencyList.get(source)?.push(target);
	}

	isAcyclic(): boolean {
		const visited = new Set<number>();
		const recursionStack = new Set<number>();

		const dfs = (node: number): boolean => {
			visited.add(node);
			recursionStack.add(node);

			const neighbors = this.adjacencyList.get(node) || [];
			for (const neighbor of neighbors) {
				if (!visited.has(neighbor)) {
					if (dfs(neighbor)) return true;
				} else if (recursionStack.has(neighbor)) {
					return true;
				}
			}

			recursionStack.delete(node);
			return false;
		};

		for (const node of this.nodes.keys()) {
			if (!visited.has(node)) {
				if (dfs(node)) return false;
			}
		}

		return true;
	}

	getNodeCount(): number {
		return this.nodes.size;
	}

	getEdgeCount(): number {
		let count = 0;
		for (const edges of this.adjacencyList.values()) {
			count += edges.length;
		}
		return count;
	}

	getNode(id: number): Node | undefined {
		return this.nodes.get(id);
	}

	getAllNodes(): Node[] {
		return Array.from(this.nodes.values());
	}

	getNeighbors(nodeId: number): number[] {
		return this.adjacencyList.get(nodeId) || [];
	}

	getStartNodes(): Node[] {
		const incomingEdges = new Set<number>();
		for (const edges of this.adjacencyList.values()) {
			for (const edge of edges) {
				incomingEdges.add(edge);
			}
		}
		return this.getAllNodes().filter((node) => !incomingEdges.has(node.id));
	}

	topologicalSort(): number[] {
		const visited = new Set<number>();
		const sortedOrder: number[] = [];

		const dfs = (nodeId: number) => {
			if (visited.has(nodeId)) return;
			visited.add(nodeId);

			const neighbors = this.getNeighbors(nodeId);
			for (const neighbor of neighbors) {
				dfs(neighbor);
			}

			sortedOrder.unshift(nodeId);
		};

		for (const node of this.nodes.keys()) {
			if (!visited.has(node)) {
				dfs(node);
			}
		}

		return sortedOrder;
	}

	findPath(startNodeId: number, endNodeId: number): number[] | null {
		const visited = new Set<number>();
		const path: number[] = [];

		const dfs = (nodeId: number): boolean => {
			visited.add(nodeId);
			path.push(nodeId);

			if (nodeId === endNodeId) {
				return true;
			}

			const neighbors = this.getNeighbors(nodeId);
			for (const neighbor of neighbors) {
				if (!visited.has(neighbor)) {
					if (dfs(neighbor)) {
						return true;
					}
				}
			}

			path.pop();
			return false;
		};

		if (dfs(startNodeId)) {
			return path;
		}

		return null;
	}
}
