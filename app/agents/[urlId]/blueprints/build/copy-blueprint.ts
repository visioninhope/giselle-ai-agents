import type { Blueprint } from "@/app/agents/blueprints";
import { blueprints, db, edges, nodes, ports } from "@/drizzle";

export const copyBlueprint = async (blueprint: Blueprint) => {
	const [newBlueprint] = await db
		.insert(blueprints)
		.values({
			agentId: blueprint.agent.id,
			version: blueprint.version + 1,
		})
		.returning({
			id: blueprints.id,
		});

	const newNodes = await db
		.insert(nodes)
		.values(
			blueprint.nodes.map((node) => ({
				blueprintId: newBlueprint.id,
				position: node.position,
				type: node.type,
			})),
		)
		.returning({
			id: nodes.id,
		});
	const nodesIdMap: Record<number, number> = {};
	for (let i = 0; i < blueprint.nodes.length; i++) {
		nodesIdMap[blueprint.nodes[i].id] = newNodes[i].id;
	}
	const allPorts = blueprint.nodes.flatMap((node) => [
		...node.inputPorts,
		...node.outputPorts,
	]);
	const newPorts = await db
		.insert(ports)
		.values(
			allPorts.map(({ name, nodeId, direction, type, order }) => ({
				name,
				nodeId: nodesIdMap[nodeId],
				direction,
				type,
				order,
			})),
		)
		.returning({
			id: ports.id,
		});
	const portIdMap: Record<number, number> = {};
	for (let i = 0; i < allPorts.length; i++) {
		portIdMap[allPorts[i].id] = newPorts[i].id;
	}
	await db.insert(edges).values(
		blueprint.edges.map((edge) => ({
			blueprintId: newBlueprint.id,
			inputPortId: portIdMap[edge.inputPort.id],
			outputPortId: portIdMap[edge.outputPort.id],
			edgeType: edge.edgeType,
		})),
	);
};
