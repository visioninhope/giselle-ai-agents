import {
	type edges as edgesSchema,
	type nodes as nodesSchema,
	workspaces,
} from "@/drizzle/schema";
export type Node = typeof nodesSchema.$inferSelect;
type Edge = typeof edgesSchema.$inferSelect;

export type WorkflowData = {
	nodes: Node[];
	edges: Edge[];
};

export class Graph {
	private nodes: Map<number, Node>;
	private edges: Map<number, number[]>;

	constructor(nodes: Node[], edges: Edge[]) {
		this.nodes = new Map(nodes.map((node) => [node.id, node]));
		this.edges = new Map();
		for (const edge of edges) {
			const edgeBySource = this.edges.get(edge.sourceNodeId);
			if (edgeBySource == null) {
				this.edges.set(edge.sourceNodeId, []);
			}
			// biome-ignore lint/style/noNonNullAssertion: This is safe because we just set it above
			edgeBySource!.push(edge.targetNodeId);
		}
	}

	getNode(id: number): Node | undefined {
		return this.nodes.get(id);
	}

	getAllNodes(): Node[] {
		return Array.from(this.nodes.values());
	}

	getNeighbors(nodeId: number): number[] {
		return this.edges.get(nodeId) || [];
	}

	topologicalSort(): number[] {
		const visited = new Set<number>();
		const result: number[] = [];

		const dfs = (nodeId: number) => {
			if (visited.has(nodeId)) return;
			visited.add(nodeId);

			const neighbors = this.getNeighbors(nodeId);
			for (const neighbor of neighbors) {
				dfs(neighbor);
			}

			result.unshift(nodeId);
		};

		for (const nodeId of this.nodes.keys()) {
			if (!visited.has(nodeId)) {
				dfs(nodeId);
			}
		}

		return result;
	}
}
