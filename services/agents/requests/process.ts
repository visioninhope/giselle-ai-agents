"use server";

import { agents, builds, db, edges, nodes, ports, requests } from "@/drizzle";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import invariant from "tiny-invariant";
import type { AgentId } from "../types";

export const buildPlaygroundGraph = async (agentId: AgentId) => {
	const [agent] = await db.select().from(agents).where(eq(agents.id, agentId));
	invariant(agent.graphHash != null, "Agent graph must be set");

	const [build] = await db
		.select()
		.from(builds)
		.where(eq(builds.graphHash, agent.graphHash));
	if (build != null) {
		return { id: build.id };
	}
	const [newBuild] = await db
		.insert(builds)
		.values({
			id: `bld_${createId()}`,
			agentDbId: agent.dbId,
			graph: agent.graph,
			graphHash: agent.graphHash,
		})
		.returning({
			id: builds.id,
			dbId: builds.dbId,
		});
	const newNodes = await db
		.insert(nodes)
		.values(
			agent.graph.nodes.map(({ id, className, data, ports, name }) => ({
				id,
				buildDbId: newBuild.dbId,
				className,
				data,
				graph: {
					id,
					name,
					className,
					data,
					ports,
				},
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
				buildDbId: newBuild.dbId,
				sourcePortDbId: sourcePort.dbId,
				targetPortDbId: targetPort.dbId,
			} satisfies typeof edges.$inferInsert;
			return edgeInsertValue;
		})
		.filter((v) => v != null);
	await db.insert(edges).values(edgeInsertValues);
	return { id: newBuild.id };
};

export const createRequest = async (
	buildId: (typeof builds.$inferInsert)["id"],
) => {
	const [build] = await db
		.select({ dbId: builds.dbId })
		.from(builds)
		.where(eq(builds.id, buildId));
	const requestId = `rqst_${createId()}` as const;
	const [newRequest] = await db
		.insert(requests)
		.values({
			id: requestId,
			buildDbId: build.dbId,
		})
		.returning({
			dbId: requests.dbId,
		});
	return { requestId };
};
