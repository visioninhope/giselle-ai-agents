"use server";

import {
	agents,
	blueprints,
	db,
	edges,
	nodes,
	ports,
	requests,
} from "@/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";
import type { AgentId } from "../types";

export const getOrBuildBlueprint = async (agentId: AgentId) => {
	const [agent] = await db.select().from(agents).where(eq(agents.id, agentId));
	invariant(agent.graphHash != null, "Agent graph must be set");

	const [blueprint] = await db
		.select()
		.from(blueprints)
		.where(eq(blueprints.graphHash, agent.graphHash));
	if (blueprint != null) {
		return { id: blueprint.id };
	}
	const [newBlueprint] = await db
		.insert(blueprints)
		.values({
			id: `blpr_${createId()}`,
			agentDbId: agent.dbId,
			graph: agent.graph,
			graphHash: agent.graphHash,
		})
		.returning({
			id: blueprints.id,
			dbId: blueprints.dbId,
		});
	const newNodes = await db
		.insert(nodes)
		.values(
			agent.graph.nodes.map(({ id, className, data }) => ({
				id,
				blueprintDbId: newBlueprint.dbId,
				className,
				data,
			})),
		)
		.returning({
			id: nodes.id,
			dbId: nodes.dbId,
		});
	const portInsertValues = agent.graph.nodes
		.flatMap((node) =>
			node.ports.map(({ id, name, nodeId, type, direction }) => {
				const [node] = newNodes.filter((node) => node.id === nodeId);
				if (node == null) {
					return null;
				}
				const portInsertValue = {
					id,
					name,
					nodeDbId: node.dbId,
					type,
					direction,
				} satisfies typeof ports.$inferInsert;
				return portInsertValue;
			}),
		)
		.filter((v) => v != null);
	const newPorts = await db.insert(ports).values(portInsertValues).returning({
		id: ports.id,
		dbId: ports.dbId,
	});
	const edgeInsertValues = agent.graph.edges
		.map(({ id, sourcePortId, targetPortId }) => {
			const sourcePort = newPorts.find(({ id }) => id === sourcePortId);
			const targetPort = newPorts.find(({ id }) => id === targetPortId);
			if (sourcePort == null || targetPort == null) {
				return null;
			}
			const edgeInsertValue = {
				id,
				blueprintDbId: newBlueprint.dbId,
				sourcePortDbId: sourcePort.dbId,
				targetPortDbId: targetPort.dbId,
			} satisfies typeof edges.$inferInsert;
			return edgeInsertValue;
		})
		.filter((v) => v != null);
	await db.insert(edges).values(edgeInsertValues);
	return { id: newBlueprint.id };
};

export const createRequest = async (
	blueprintId: (typeof blueprints.$inferInsert)["id"],
) => {
	const [blueprint] = await db
		.select({ dbId: blueprints.dbId })
		.from(blueprints)
		.where(eq(blueprints.id, blueprintId));
	const requestId = `rqst_${createId()}` as const;
	const [newRequest] = await db
		.insert(requests)
		.values({
			id: requestId,
			blueprintDbId: blueprint.dbId,
		})
		.returning({
			dbId: requests.dbId,
		});
	return { requestId };
};
