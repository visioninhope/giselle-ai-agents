import type { Blueprint } from "@/app/agents/blueprints";
import type { steps as stepsSchema } from "@/drizzle";

type DbStep = typeof stepsSchema.$inferSelect;

type Step = Omit<DbStep, "blueprintId" | "id">;

export const inferSteps = ({ nodes, edges }: Blueprint) => {
	const steps: Step[] = [];
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

		const outgoingEdges = edges.filter(
			({ outputPort, edgeType }) =>
				outputPort.nodeId === nodeId && edgeType === "execution",
		);
		for (const edge of outgoingEdges) {
			dfs(edge.inputPort.nodeId, order + 1);
		}
	};
	const targetNodeIds = new Set(
		edges
			.filter(({ edgeType }) => edgeType === "execution")
			.map((edge) => edge.inputPort.nodeId),
	);
	const startNode = nodes.find((node) => node.className === "onRequest");
	if (startNode == null) {
		return [];
	}
	dfs(startNode.id, 0);
	return steps;
};
