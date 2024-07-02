import {
	type edges as edgesSchema,
	type nodes as nodesSchema,
	workflows,
} from "@/drizzle/schema";
import invariant from "tiny-invariant";

type EdgeData = typeof edgesSchema.$inferSelect;
type NodeData = typeof nodesSchema.$inferSelect & {
	edges: { to: string }[];
};

export class DirectedAcyclicGraph {
	private nodes: Map<string, NodeData>;
	private incomingEdges: Map<string, Set<string>>;

	constructor() {
		this.nodes = new Map();
		this.incomingEdges = new Map();
	}

	addNode(id: string, data: NodeData): void {
		if (!this.nodes.has(id)) {
			this.nodes.set(id, { ...data, edges: [] });
			this.incomingEdges.set(id, new Set());
		}
	}

	addEdge(
		fromId: string,
		toId: string,
		edgeHandle: string,
		data: EdgeData,
	): void {
		const fromNode = this.nodes.get(fromId);
		invariant(fromNode != null, "Node not found");
		const toNode = this.nodes.get(toId);
		invariant(toNode != null, "Node not found");

		fromNode.edges.push({ to: toId });
	}

	traverse(id: string): void {
		const visited = new Set<string>();
		const stack = [id];

		while (stack.length > 0) {
			const current = stack.pop();
			if (current == null || visited.has(current)) {
				continue;
			}
			visited.add(current);
			const node = this.nodes.get(current);
			if (node == null) {
				continue;
			}
			console.log(node);
			for (const edge of node.edges) {
				stack.push(edge.to);
			}
		}
	}
}
