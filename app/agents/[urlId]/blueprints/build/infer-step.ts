import type { Blueprint } from "@/app/agents/blueprints";
import type { steps as stepsSchema } from "@/drizzle";
import invariant from "tiny-invariant";

type DbStep = typeof stepsSchema.$inferSelect;

export const inferSteps = ({ nodes, edges }: Blueprint) => {
	const steps: Omit<DbStep, "blueprintId" | "id">[] = [];
	const visited = new Set<number>();
	const dfs = (nodeId: number, order: number) => {
		if (visited.has(nodeId)) return;
		visited.add(nodeId);

		const node = nodes.find((n) => n.id === nodeId);
		if (!node) return;

		steps.push({
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
	return steps;
};
