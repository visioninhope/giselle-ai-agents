"use server";

import { blueprints, db, edges, edgesBlueprints, ports } from "@/drizzle";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";
import type { Edge } from "..";

type ConnectNodesArgs = {
	blueprintId: number;
	edge: Edge;
};
export const connectNodes = async ({ blueprintId, edge }: ConnectNodesArgs) => {
	const blueprint = await db.query.blueprints.findFirst({
		where: eq(blueprints.id, blueprintId),
	});
	invariant(blueprint != null, `Blueprint not found: ${blueprintId}`);
	const [insertedEdge] = await db
		.insert(edges)
		.values({
			agentId: blueprint.agentId,
			inputPortId: edge.inputPort.id,
			outputPortId: edge.outputPort.id,
			edgeType: edge.edgeType,
		})
		.returning({
			id: edges.id,
		});
	await db.insert(edgesBlueprints).values({
		edgeId: insertedEdge.id,
		blueprintId: blueprint.id,
	});
	return {
		id: insertedEdge.id,
	};
};
