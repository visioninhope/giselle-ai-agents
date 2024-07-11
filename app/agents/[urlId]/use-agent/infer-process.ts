import type { processes } from "@/drizzle/schema";
import invariant from "tiny-invariant";
import type { Blueprint } from "../_helpers/get-blueprint";

type DbProcess = typeof processes.$inferSelect;

export const inferProcesses = ({ nodes, edges }: Blueprint) => {
	const processes: Omit<DbProcess, "blueprintId" | "id">[] = [];
	const visited = new Set<number>();
	const dfs = (nodeId: number, order: number) => {
		if (visited.has(nodeId)) return;
		visited.add(nodeId);

		const node = nodes.find((n) => n.id === nodeId);
		if (!node) return;

		processes.push({
			nodeId: node.id,
			order,
		});

		const outgoingEdges = edges.filter((e) => e.outputPort.nodeId === nodeId);
		for (const edge of outgoingEdges) {
			dfs(edge.inputPort.nodeId, order + 1);
		}
	};
	const targetNodeIds = new Set(edges.map((edge) => edge.inputPort.nodeId));
	const startNode = nodes.find((node) => !targetNodeIds.has(node.id));
	invariant(startNode != null, "Not found");
	dfs(startNode.id, 0);
	return processes;
};
